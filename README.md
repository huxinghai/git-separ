# git-separ
ember-cli编译的静态文件独立分支打包存储工具


#using

  $ gsp setup
  prompt: branch name:  (_deploy)
  prompt: git ssh url:  git@github.com:test/test_assets.git
  prompt: ember build output path:  (dist)
  prompt: production environment tag prefix:  (prod)


  $ gsp push -m "test gsp" -t 0.0.1