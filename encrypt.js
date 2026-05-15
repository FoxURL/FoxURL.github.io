// FoxURL Encryption Engine (Stable Multi-layer)
// encrypt.js

const FOX_CHARSET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1!2@3#4$5%6^7&8*9(0){}[]:;<,>.?/\"'\\|";

function shiftChar(char, shift) {
    const index = FOX_CHARSET.indexOf(char);
    if (index === -1) return char;
    const len = FOX_CHARSET.length;
    const newIndex = (index + shift) % len;
    return FOX_CHARSET[newIndex < 0 ? newIndex + len : newIndex];
}

// Base encryption (one cycle)
function foxEncryptSingle(value) {
    let perChar = "";
    for (let i = 0; i < value.length; i++) {
        const ch = value[i];
        if (ch === " ") {
            perChar += " ";
            continue;
        }
        perChar += shiftChar(ch, i + 1);
    }

    const shiftAmount = value.length;
    let global = "";
    for (let ch of perChar) {
        if (ch === " ") {
            global += " ";
            continue;
        }
        global += shiftChar(ch, shiftAmount);
    }

    return global;
}

// Multi-layer encryption
function foxEncrypt(value) {
    let encrypted = value;

    const times = Math.floor(Math.random() * 9) + 1;

    for (let i = 0; i < times; i++) {
        encrypted = foxEncryptSingle(encrypted);
    }

    const startDummy = FOX_CHARSET[Math.floor(Math.random() * FOX_CHARSET.length)];
    const endDummy = FOX_CHARSET[Math.floor(Math.random() * FOX_CHARSET.length)];

    return startDummy + encrypted + endDummy + times.toString();
}

// Base decryption (one cycle)
function foxDecryptSingle(value) {
    const shiftAmount = value.length;
    let unshifted = "";

    for (let i = 0; i < value.length; i++) {
        const ch = value[i];
        if (ch === " ") {
            unshifted += " ";
            continue;
        }
        unshifted += shiftChar(ch, -shiftAmount);
    }

    let original = "";
    for (let i = 0; i < unshifted.length; i++) {
        const ch = unshifted[i];
        if (ch === " ") {
            original += " ";
            continue;
        }
        original += shiftChar(ch, -(i + 1));
    }

    return original;
}

// Multi-layer decryption
function foxDecrypt(value) {
    const times = parseInt(value[value.length - 1], 10);
    let core = value.slice(0, -1);

    core = core.slice(1, -1);

    for (let i = 0; i < times; i++) {
        core = foxDecryptSingle(core);
    }

    return core;
}

window.foxEncrypt = foxEncrypt;
window.foxDecrypt = foxDecrypt;
