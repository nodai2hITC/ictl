'use strict';

function ictl_compile(program) {
    // 行番号を除去
    program = program.replace(/^\(\d+\)\s*/gm, "");
    // ｜を除去
    while (program.match(/^(\s*)｜/m)) {
        program = program.replace(/^(\s*)｜/gm, "$1 ");
    }
    // 行頭の⎿を 行末の } に変換
    while (program.match(/^(\s*)⎿(.+)/m)) {
        program = program.replace(/^(\s*)⎿(.+)/gm, "$1 $2 }");
    }
    // 配列へのアクセスを、デフォルト値が使えるように変換
    program = program.replace(/(\w+)(\[[^\]]+\])(\s*([^=\s]|==|$))/g,
                              "($1$2 == undefined ? $1.default : $1$2)$3");
    // 「もし〇ならば:」を「if (〇) {」に変換
    program = program.replace(/もし\s*(.+?)\s*ならば:/g,
                              "if ($1) {");
    // 「そうでなければ:」を「} else {」に変換
    program = program.replace(/そうでなければ:/g,
                              "} else {");
    // 「〇 を △ から □ まで ☆ ずつ増やしながら:」を「for (〇 = △; 〇 <= □; 〇 += ☆) {」に変換
    program = program.replace(/(\w+)\s*を\s*(.+?)\s*から\s*(.+?)\s*まで\s*(.+?)\s*ずつ増やしながら:/g,
                              "for ($1 = $2; $1 <= $3; $1 += $4) {");
    // 「配列 〇 のすべての要素に △ を代入する」を「〇 = []; 〇.default = △」に変換
    program = program.replace(/配列\s*(\w+)\s*のすべての要素に\s*(.+?)\s*を代入する/g,
                              "$1 = []; $1.default = $2");
    // 「配列変数 〇 を初期化する」を「〇 = []」に変換
    program = program.replace(/配列変数\s*(\w+)\s*を初期化する/g,
                              "$1 = []");

    return program;
}

function 要素数(array) {
    return array.length;
}

function 文字(num) {
    if (num < 0 || num > 25) return "アルファベットでない";
    return "abcdefghijklmnopqrstuvwxyz".substr(num, 1);
}

function 差分(char) {
    return "abcdefghijklmnopqrstuvwxyz".indexOf(char);
}

function 表示する(value) {
    document.getElementById("output").value += value.toString() + "\n";
}
