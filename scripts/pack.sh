rm nerdalert.zip
zip -r nerdalert.zip client/ server/ Dockerfile -x "**/node_modules/*" "**/.DS_Store"
