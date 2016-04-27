var fs = require('fs'),
  fse = require("fs.extra"),
  simpleGit = require('simple-git');

var task = function(){
  this.basedir = process.cwd();
  this.configPath = this.basedir + "/ember_git_separ";
  this.config = {};
  this.git = null
}

var proxy = function(callback, that){
  return function(){
    callback.apply(that, arguments)
  }
}

var trim

task.prototype = {
  setup: function(branch, repository_url, output_dir){
    var content = "branch: "+ branch +"\r\nrepository_url: "+ repository_url +"\r\noutput_dir: "+ output_dir;
  
    if(this.validConfig())
      fs.unlinkSync(this.configPath)

    if(fs.appendFileSync(this.configPath, content)){
      console.log("setup successful! ")
    }
  },
  push: function(commit, tag){
    if(!fs.existsSync(this.branchPath())) fs.mkdirSync(this.branchPath());

    var git = this.createGitInstance(),
      self = this,
      config = this.readConfig();

    git.init().getRemotes(function(err, remotes){
      if(remotes.length == 0 || remotes[0].name != "origin"){
        return git.addRemote("origin", config.repository_url, function(err, handler){
          if(err){
            console.log("error: ", err)
            return 
          }
          self.gitCommit(commit)
        })
      }

      self.gitCommit(commit)
    })
  },
  validConfig: function(){
    return fs.existsSync(this.configPath)
  },
  readConfig: function(){
    var self = this;

    if(!this.validConfig()){
      console.log("please run setup command!")
      return
    }

    if(this.isEmpty(this.config)) return this.config

    var data = fs.readFileSync(this.configPath, "utf8"),
      items = data.split("\r\n");

    items.forEach(function(item){
      if(item && item != ""){
        var tmp = item.split(/^(\w+):?/)
        self.config[tmp[1].trim()] = tmp[2].trim()
      }
    })
    return this.config
  },
  isEmpty: function(content){
    return Object.keys(content).length > 0
  },
  createGitInstance: function(){
    if(!this.git){
      this.git = simpleGit(this.branchPath())
    }
    return this.git
  },
  branchPath: function(){
    var config = this.readConfig()
    return this.basedir + "/"+ config.branch;
  },
  outputDir: function(){
    var config = this.readConfig()
    return this.basedir + "/"+ config.output_dir;
  },
  gitCommit: function(commit){
    var self = this,
      config = this.readConfig(),
      git = this.createGitInstance();

    return git.checkoutLocalBranch(config.branch, function(err, res){
      console.log("res", err, res)
      fse.copyRecursive(self.outputDir(), self.branchPath(), { replace: false }, function(err){
        if(err){
          console.log("error: ", err)
          return
        }
      })
    }).add("./*").commit(commit).push('origin', config.branch)
  }
}

module.exports = new task()