'use strict';

var ICTL = ICTL || {};

(function() {
    ICTL.compile = function(program, one_based = false) {
        // 行番号を除去
        program = program.replace(/^\(\s*[0-9\-]+\s*\) */mg, "");
        // ｜を除去
        while (program.match(/^(\s*)[｜│┃]/m)) {
            program = program.replace(/^(\s*)[｜│┃]/mg, "$1  ");
        }
        // 継続行を連結
        program = program.replace(/([,+\-*\/]\s*)\n/g, "$1");

        // 行頭の⎿を 行末の } に変換
        while (program.match(/^(\s*)[⎿└┗├┣](.+)/m)) {
            program = program.replace(/^(\s*)[⎿└┗├┣](.+)/mg, "$1  $2 }");
        }

        // 「そうでなくもし〇ならば:」を「} else if (〇) {」に変換
        program = program.replace(/そうでなくもし(.+?)ならば[:：]$/mg, function(m, p1) {
            return "} else if (" + replace_and_or(p1) +") {";
        });
        // 「もし〇ならば:」を「if (〇) {」に変換
        program = program.replace(/もし(.+?)ならば[:：]$/mg, function(m, p1) {
            return "if (" + replace_and_or(p1) + ") {";
        });
        // 「そうでなければ:」を「} else {」に変換
        program = program.replace(/そうでなければ[:：]$/mg, "} else {");

        // 「〇 を △ から □ まで ☆ ずつ増やしながら繰り返す:」を「for (〇 = △; 〇 <= □; 〇 += ☆) {」に変換
        program = program.replace(/(\w+)\s*を\s*(.+?)\s*から\s*(.+?)\s*まで\s*(.+?)\s*ずつ増やしながら(?:繰り返す)?[:：]$/mg,
                                "for ($1 = $2; $1 <= $3; $1 += $4) {");
        // 「〇 を △ から □ まで ☆ ずつ減らしながら繰り返す:」を「for (〇 = △; 〇 <= □; 〇 -= ☆) {」に変換
        program = program.replace(/(\w+)\s*を\s*(.+?)\s*から\s*(.+?)\s*まで\s*(.+?)\s*ずつ減らしながら(?:繰り返す)?[:：]$/mg,
                                "for ($1 = $2; $1 >= $3; $1 -= $4) {");
        // 「〇の間繰り返す:」を「while (〇) {」に変換
        program = program.replace(/(.+?)の間繰り返す[:：]$/mg, function(m, p1) {
            return "while (" + replace_and_or(p1) + ") {";
        });

        // 「【外部からの入力】」を「parseFloat(prompt());」に変換
        program = program.replace(/【外部からの入力】$/mg, "parseFloat(prompt());");

        // 「配列変数 〇 を初期化する」を「〇 = [];」に変換
        program = program.replace(/配列変数\s*(\w+)\s*を初期化する$/mg, "$1 = [];");
        // 「要素数□の配列 〇 のすべての要素に △ を代入する」を「〇 = [].concat(Array(□).fill(△))」に変換
        program = program.replace(/要素数(.+)の配列\s*(\w+)\s*のすべての要素に\s*(.+?)\s*を代入する$/mg, function(m, p1, p2, p3) {
            return `${p2} = [].concat(Array(${p1}).fill(${p3}));`;
        });
        // 「配列 〇 のすべての要素に △ を代入する」を「〇 = new Proxy([], { get: function(obj, prop) { return prop in obj ? obj[prop] : △; } });」に変換
        program = program.replace(/配列\s*(\w+)\s*のすべての要素に\s*(.+?)\s*を代入する$/mg, function(m, p1, p2) {
            return p1 + " = new Proxy([], { get: function(obj, prop) { return prop in obj ? obj[prop] : " + p2 + "; } })";
        });

        // 配列の添字が 1 始まりの場合、「= [...]」を「= [undefined, ...]」に変換
        if (one_based) {
            program = program.replace(/(=\s*\[)([^\]]*\])/mg, "$1undefined, $2");
        }

        // 配列の初期化処理の追加
        let arrays = Array.from(new Set(program.match(/(\w+)\[/g)));
        if (arrays) {
            for (let i = 0; i < arrays.length; i++) {
                if (program.replaceAll(" ", "").indexOf(arrays[i].replace("[", "=[")) != -1) continue;
                program = arrays[i].replace("[", "=[];") + program;
            }
        }

        // 「＋」を「+」に変換
        program = program.replace(/＋/mg, "+");
        // 「－」を「-」に変換
        program = program.replace(/－/mg, "-");
        // 「〇 ÷ △」を「Math.floor(〇 / △)」に変換（※ かなりテキトー）
        program = program.replace(/([^\s=]+\s*)÷(\s*\S+)/mg, "Math.floor($1/$2)");
        // 「％」を「%」に変換
        program = program.replace(/％/mg, "%");
        // 「＜」を「<」に変換
        program = program.replace(/＜/mg, "<");
        // 「＞」を「>」に変換
        program = program.replace(/＞/mg, ">");

        // 「#」を「//」に変換
        program = program.replace(/#/mg, "//");

        return program;
    };

    ICTL.format = function(program) {
        program = program.replace(/^(?:\([0-9\-]+\))? */mg, "");
        while (program.match(/^[｜│┃] */m)) {
            program = program.replace(/^[｜│┃] */mg, "");
        }
        program = program.replace(/[\r\n]+$/, "");
        let lines = program.split(/\r?\n/);
        let indent = 0;
        let new_program = "";
        let digits = 2;
        if (lines.length >= 100) digits = lines.length.toString().length;
        let num = 0;
        let continuation = false;
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            indent += 1 - line.split(/[⎿└┗├┣]/).length;
            if (line.match(/そうでなくもし(.+?)ならば[:：]$/m) ||
                line.match(/そうでなければ[:：]$/m)) indent--;
            if (indent < 0) indent = 0;
            if (continuation) {
                new_program += "            ".slice(-digits - 3);
            } else {
                num += 1;
                new_program += "(" + ("0000000000" + num.toString()).slice(-digits) + ") ";
            }
            for (let j = 0; j < indent; j++) new_program += " ｜ ";
            new_program += line.replace(/\s*[⎿└┗├┣]\s*/g, " ⎿ ") + "\n";
            if (line.match(/[:：]\s*$/)) indent++;
            continuation = !!line.match(/[,+\-*\/]\s*$/);
        }
        return new_program;
    };

    // and, or, not を &&, ||, ! に変換
    function replace_and_or(condition) {
        return condition.replace(/ and /g, " && ").replace(/ or /g, " || ").replace(/ not /g, " ! ");
    };
})();

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
