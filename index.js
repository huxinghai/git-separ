var command = require('commander'),
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
  if(command.commit && command.tag &&
    typeof command.commit == "boolean" != typeof command.tag != "boolean"){
    task.push(command.commit, command.tag)  
  }else{
    console.error("error: must input commit and tag argument!")
  }
}