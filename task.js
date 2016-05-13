var fs = require('fs'),
  fse = require("fs-extra"),
  chalk = require('chalk'),
  simpleGit = require('simple-git');

var task = function(){
  this.basedir = process.cwd();
  this.configPath = this.basedir + "/git_separ";
  this.gitignorePath = this.basedir + "/.gitignore"
  this.remote_name = 'origin'
  this._config = {};
  this.git = null
}

task.prototype = {
  setup: function(data){
    if(this.validConfig())
      fs.unlinkSync(this.configPath)

    if(fs.existsSync(this.gitignorePath))
      fs.appendFileSync(this.gitignorePath, "\r\n"+ data.branch)      

    if(fs.appendFileSync(this.configPath, this.renderTemplate(data))){
      console.log("create config path "+ this.configPath);
      console.log(chalk.green("setup successful! "));
    }
  },
  push: function(commit, tag){
    if(fs.existsSync(this.branchPath())){
      fse.removeSync(this.branchPath())
    }
    var config = this.readConfig();

    fs.mkdirSync(this.branchPath());
    this.gitCommit(commit, tag);
    console.log(chalk.green("assets push "+ config.repository_url +" branch "+ config.branch))
  },
  validConfig: function(){
    return fs.existsSync(this.configPath)
  },
  readConfig: function(){
    if(!this.validConfig()){
      console.log(chalk.red("Please run setup command!"))
      return
    }
    if(this.isEmptyObject(this._config)){
      var data = fs.readFileSync(this.configPath, "utf8"),
        self = this,
        items = data.split("\r\n");

      items.forEach(function(item){
        if(item && item != ""){
          var tmp = item.split(/^(\w+):?/)
          self._config[tmp[1].trim()] = tmp[2].trim()
        }
      })
    }
    return this._config
  },
  isEmptyObject: function(content){
    return Object.keys(content).length <= 0
  },
  createGitInstance: function(){
    return (this.git || (this.git = simpleGit(this.branchPath())))
  },
  branchPath: function(){
    return this.basedir + "/"+ this.readConfig().branch;
  },
  outputDir: function(){
    return this.basedir + "/"+ this.readConfig().output_dir;
  },
  gitCommit: function(commit, tag){
    var self = this,
      config = this.readConfig(),
      git = this.createGitInstance();


    var obj = git.init().checkoutLocalBranch(config.branch).addRemote(this.remote_name, config.repository_url)

    obj.listRemote(['--heads'], function(err, heads){
      if(err){
        console.log("error: ", err)
        return 
      } 

      var copySuccessful = function(){
        self.copyToDeploy(function(){
          obj.add("./*").commit(commit).push(self.remote_name, config.branch).addTag(self.tagName(tag)).pushTags(self.remote_name)
        })
      }

      if(~heads.indexOf("refs/heads/"+ config.branch)){
        obj.pull(self.remote_name, config.branch, function(){
          copySuccessful()
        }) 
      }else{
        copySuccessful()
      }
    })
    
  },
  tagName: function(tag){
    var c = this.readConfig()
    if(/^(test\.|dev\.|prod\.)/.test(tag))
      return tag

    return c.tag_prefix + "."+ tag
  },
  renderTemplate: function(res){
    var content = ""
    for(var k in res){
      content += k + ": "+ res[k] + "\r\n"
    }
    return content
  },
  copyToDeploy: function(callback){
    fse.copy(this.outputDir(), this.branchPath(), function(err){
      if(err){
        console.log("error: ", err)
        return
      }
      callback && callback()
    })
  },
  tags: function(){
    var git = this.createGitInstance(),
      config = this.readConfig();

    git.fetch(this.remote_name).pull(this.remote_name, config.branch).tags(function(err, tags){
      tags.all.forEach(function(tag){
        console.log(chalk.green(tag))  
      })
    })  
  }
}

module.exports = new task()