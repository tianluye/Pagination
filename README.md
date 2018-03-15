# Pagination
基于 jQueryUI的分页 Pagination组件

使用：

```js
// 初始化
var pagination = $(".pageDiv").pagination({
    perPage : 10,
    totalRecords : 93,
    curr : 1,
    selectedColor : '#1E9FFF',
    jump : function(e, curr, perPage) {
    	console.log('the current page is ' + curr);
    },
    create: function(e, createEventData) {
        console.log(createEventData);
    }
});
$('#one').on('click', function() {
    // 支持 previous、start、next、end、数字这些参数
    pagination.pagination('showPage', 3);
});
$('#two').on('click', function() {
    pagination.pagination('allRecords', 62);
});
$('#three').on('click', function() {
    pagination.pagination('perPage', 8);
});
```