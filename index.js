var command = require('commander'),
  prompt = require('prompt'),
  fs = require('fs');

process.title = "ember_separ"

command
  .version('0.0.1')
  .option('setup', 'setup config file')
  .option('push', 'push remote repository')
  .option('-m --commit [value]', 'git commit')
  .option('-t --tag [value]', 'git tag')
  .parse(process.argv);


if(command.setup){
  prompt.start();
  var schema = {
    properties: {
      branch: {
        message: "branch name",
        default: "_deploy"
      },
      repository_url: {
        message: "git ssh url",
        required: true
      }
    }
  }

  prompt.get(schema, function (err, result) {
    if (err) { 
      return console.log(err); 
    }
    task.setup(result.branch, result.repository_url)
  });
}else if(command.push){
  if(command.commit || command.tag || 
    typeof command.commit == "boolean" || typeof command.tag == "boolean"){
    console.error("error: must input commit and tag argument!")
    return 
  }
  task.push(command.commit, command.tag)
}

var _task = function(){
  this.basedir = process.cwd();
  this.configPath = this.basedir + "/ember_git_separ";
}

_task.prototype = {
  setup: function(branch, repository_url){
    var content = "branch: "+ branch +"\r\nrepository_url: "+ repository_url +"\r\noutput_dir: dist";
  
    fs.unlinkSync(this.configPath)
    if(fs.appendFileSync(this.configPath, content)){
      console.log("setup successful! ")
    }
  },
  push: function(commit, tag){
    if(!this.validConfig()){
      console.log("please run setup command!")
      return
    } 
    
  },
  validConfig: function(){
    return fs.existsSync(this.configPath)
  }
}

var task = new _task()