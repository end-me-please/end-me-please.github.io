//function to randomly scramble letters
function scramble(str) {
    var arr = str.split('');
    var tmp, rand;

    for (var i = arr.length - 1; i > 0; i--) {
        rand = Math.floor(Math.random() * (i + 1));
        tmp = arr[i];
        arr[i] = arr[rand];
        arr[rand] = tmp;
    }
    return arr.join('');
}
//scramble the letters "sus amogus" and set page title
document.title = scramble("amogus") + scramble(" sus");