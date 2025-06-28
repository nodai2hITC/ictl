function 要素数(array) {
    if (array[0] === undefined) return array.length - 1;
    return array.length;
}

function 文字(num) {
    if (num < 0 || num > 25) return "アルファベットでない";
    return "abcdefghijklmnopqrstuvwxyz".substr(num, 1);
}

function 差分(char) {
    return "abcdefghijklmnopqrstuvwxyz".indexOf(char);
}

function 切り捨て(f) {
    return Math.floor(f);
}

function 整数(f) {
    return Math.floor(f);
}

function 絶対値(num) {
    return Math.abs(num);
}

function 桁数(num) {
    return num.toString().length;
}

function 乱数() {
    return Math.random();
}

function 枚数(kingaku) {
    const Kouka = [1, 5, 10, 50, 100];
    let maisu = 0, nokori = kingaku;
    for (let i = 4; i >= 0; i-=1) {
        maisu = maisu + Math.floor(nokori / Kouka[i]);
        nokori = nokori % Kouka[i];
    }
    return maisu;
}

function 表示する() {
    let str = "";
    for (let i = 0; i < arguments.length; i++){
        str += arguments[i].toString();
    }
    document.getElementById("output").value += str + "\n";
}
