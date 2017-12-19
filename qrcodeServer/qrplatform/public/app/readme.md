### 万码易联web端
#### index_src.html为源入口文件，index.html为压缩打包后入口文件
#### dist为存放压缩打包后的js和css的目录
#### 添加/修改js和css文件注意
- 在<!-- build:{type} {target} --><!-- endbuild -->之间的文件将会压缩到指定文件中
- 在<!-- rev-hash --><!-- end -->之间的文件会添加md5指纹后缀
- 在修改和添加css/js文件后，运行gulp可生成压缩打包后的文件
- 提交打包和压缩后的文件，方便其他人使用