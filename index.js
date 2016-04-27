var command = require('commander'),
  core = require("./extend_core"),
  prompt = require('prompt'),
  task = require('./task');

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
      },
      output_dir:  {
        message: "ember build output",
        default: "dist"
      }
    }
  }

  prompt.get(schema, function (err, result) {
    if (err) { 
      return console.log(err); 
    }
    task.setup(result.branch, result.repository_url, result.output_dir)
  });
}else if(command.push){
  if(command.commit && command.tag &&
    typeof command.commit == "boolean" != typeof command.tag != "boolean"){
    task.push(command.commit, command.tag)  
  }else{
    console.error("error: must input commit and tag argument!")
  }
}