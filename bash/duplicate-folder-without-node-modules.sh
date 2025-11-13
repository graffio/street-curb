# duplicate the entire graffio-monorepo folder -- ignoring the node_module folders
name="../graffio-monorepo.$(date '+%Y.%m.%d@%H.%M.%S')"
echo "copying $(pwd) to $name"
tar --exclude=./node_modules -cf - . | (mkdir "$name" && cd "$name" && tar xf - )
