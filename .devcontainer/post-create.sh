#!/bin/bash
set -e

echo "************************"
echo "*** Begin post-create..."
echo "************************"

### --------------------
### Set git author info
### --------------------
git config --global user.name "$GIT_AUTHOR_NAME"
git config --global user.email "$GIT_AUTHOR_EMAIL"


### -------------------
### Uncomment ll command in bashrc
### -------------------

sed -i -e "s/#alias ll='ls -l'/alias ll='ls -al'/g" ~/.bashrc
. $HOME/.bashrc

echo "***************************"
echo "**** Post-create complete."
echo "***************************"
