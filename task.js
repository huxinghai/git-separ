var fs = require('fs'),
  simpleGit = require('simple-git');

var task = function(){
  this.basedir = process.cwd();
  this.configPath = this.basedir + "/ember_git_separ";
  this.config = {};
  this.git = null
}

task.prototype = {
  setup: function(branch, repository_url){
    var content = "branch: "+ branch +"\r\nrepository_url: "+ repository_url +"\r\noutput_dir: dist";
  
    if(this.validConfig())
      fs.unlinkSync(this.configPath)

    if(fs.appendFileSync(this.configPath, content)){
      console.log("setup successful! ")
    }
  },
  push: function(commit, tag){
    var config = this.readConfig()
    console.log(config)
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

    if(Object.keys(this.config).length > 0) return this.config
      
    var data = fs.readFileSync(this.configPath, "utf8"),
      items = data.split("\r\n");

    items.forEach(function(item){
      if(item && item != ""){
        var tmp = item.split(":")
        self.config[tmp[0]] = tmp[1]
      }
    })
    return this.config
  },
  createGitInstance: function(){
    var config = this.readConfig()
    if(!this.git){
      this.git = simpleGit(this.basedir + "/"+ config.output_dir)
      return this.git
    }
  }
}

module.exports = new task()