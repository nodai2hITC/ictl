'use strict';

var ICTL = ICTL || {};

ICTL.default_array_size = 26;

(function() {
    ICTL.compile = function(program) {
        // 行番号を除去
        program = program.replace(/^\(\d+\) */mg, "");
        // ｜を除去
        while (program.match(/^(\s*)｜/m)) {
            program = program.replace(/^(\s*)｜/mg, "$1  ");
        }

        // 行頭の⎿を 行末の } に変換
        while (program.match(/^(\s*)⎿(.+)/m)) {
            program = program.replace(/^(\s*)⎿(.+)/mg, "$1  $2 }");
        }

        // 「もし〇ならば:」を「if (〇) {」に変換
        program = program.replace(/もし(.+?)ならば[:：]$/mg, function(m, p1) {
            return "if (" + replace_and_or(p1) + ") {";
        });
        // 「あるいは〇ならば:」を「} else if (〇) {」に変換
        program = program.replace(/あるいは(.+?)ならば[:：]$/mg, function(m, p1) {
            return "} else if (" + replace_and_or(p1) +") {";
        });
        // 「そうでなければ:」を「} else {」に変換
        program = program.replace(/そうでなければ[:：]$/mg, "} else {");

        // 「〇 を △ から □ まで ☆ ずつ増やしながら繰り返す:」を「for (〇 = △; 〇 <= □; 〇 += ☆) {」に変換
        program = program.replace(/(\w+)\s*を\s*(.+?)\s*から\s*(.+?)\s*まで\s*(.+?)\s*ずつ増やしながら(?:繰り返す)?[:：]$/mg,
                                "for ($1 = $2; $1 <= $3; $1 += $4) {");
        // 「〇の間繰り返す:」を「while (〇) {」に変換
        program = program.replace(/(.+?)の間繰り返す[:：]$/mg, function(m, p1) {
            return "while (" + replace_and_or(p1) + ") {";
        });

        // 「配列変数 〇 を初期化する」を「〇 = [];」に変換
        program = program.replace(/配列変数\s*(\w+)\s*を初期化する$/mg, "$1 = [];");
        // 「要素数□の配列 〇 のすべての要素に △ を代入する」を「〇 = []; for(let i = 0; i < □; i++) { 〇[i] = △; }」に変換
        program = program.replace(/(?:要素数(.+)の)?配列\s*(\w+)\s*のすべての要素に\s*(.+?)\s*を代入する$/mg, function(m, p1, p2, p3) {
            return p2 + " = []; " + 
                "for(let i=0; i < " + (p1 ? p1 : "ICTL.default_array_size") + "; i++) " +
                "{ " + p2 + "[i] = " + p3 + "; }";
        });

        // 配列の初期化処理の追加
        let arrays = program.match(/(\w+)\[/g);
        if (arrays) {
            let keys = {};
            for (let i = 0; i < arrays.length; i++) {
                if (keys[arrays[i]]) continue;
                program = arrays[i].replace("[", "=[];") + program;
                keys[arrays[i]] = true;
            }
        }
        return program;
    };

    ICTL.format = function(program) {
        program = program.replace(/^(?:\(\d+\))? */mg, "");
        while (program.match(/^｜ */m)) {
            program = program.replace(/^｜ */mg, "");
        }
        program = program.replace(/[\r\n]+$/, "");
        let lines = program.split(/\r?\n/);
        let indent = 0;
        let new_program = "";
        let digits = 2;
        if (lines.length >= 100) digits = lines.length.toString().length;
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            indent += 1 - line.split("⎿").length;
            if (line.match(/あるいは(.+?)ならば[:：]$/m) ||
                line.match(/そうでなければ[:：]$/m)) indent--;
            if (indent < 0) indent = 0;
            new_program += "(" + ("0000000000" + (i + 1).toString()).slice(-digits) + ")";
            for (let j = 0; j < indent; j++) new_program += "｜ ";
            new_program += line + "\n";
            if (line.match(/[:：]$/)) indent++;
        }
        return new_program;
    };

    // and, or を &&, || に変換
    function replace_and_or(condition) {
        return condition.replace(/ and /g, " && ").replace(/ or /g, " || ");
    };
})();

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

function 切り捨て(f) {
    return Math.floor(f);
}

function 表示する() {
    let str = "";
    for (let i = 0; i < arguments.length; i++){
        str += arguments[i].toString();
    }
    document.getElementById("output").value += str + "\n";
}
