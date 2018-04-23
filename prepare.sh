cd Frontend
npm run build
cd ..
cp -rf ./Frontend/dist/index.html ./view-ejs
cp -rf ./Frontend/dist/static ./public