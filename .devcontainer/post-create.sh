#!/bin/bash
set -e

echo "************************"
echo "*** Begin post-create..."
echo "************************"

### -------------------
### Uncomment ll command in bashrc
### -------------------

sed -i -e "s/#alias ll='ls -l'/alias ll='ls -al'/g" ~/.bashrc
. $HOME/.bashrc

### -------------------
### Install Paperclip
### -------------------

echo "Installing Paperclip CLI..."
npm install -g paperclipai

### -------------------
### Install BMAD
### -------------------

echo "Installing BMAD..."
npx bmad-method install

echo "***************************"
echo "**** Post-create complete."
echo "***************************"
