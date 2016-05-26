/**
 * Created by Administrator on 2016/5/20.
 */
var str = '34525192-4cef-4085-b170-35c30789d66e:eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIzNDUyNTE5Mi00Y2VmLTQwODUtYjE3MC0zNWMzMDc4OWQ2NmUiLCJleHAiOjE0NjM3MjI4MjE1NzN9.ZQ3PB565Av-t4hDuysWwGBOa-6Xb16A66PKae7JXw9A';


console.log(str.substr(str.indexOf(':')+1,str.length-str.indexOf(':')));