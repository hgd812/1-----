// 当DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('myBtn');
    
    button.addEventListener('click', function() {
        alert('你点击了按钮！JS已成功工作。');
        document.body.style.backgroundColor = '#d1e7dd';
    });
});
