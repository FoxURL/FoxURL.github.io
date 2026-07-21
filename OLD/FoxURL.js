// FoxURL.js
// GLOBAL FOX ECOSYSTEM SCRIPT
// Loaded by ALL Fox apps on ANY domain

console.log("FoxURL.js loaded");

// Global Fox namespace
const Fox = {
    version: "1.0.0",

    // Cookie utilities
    setCookie(name, value, days = 365) {
        const expires = new Date(Date.now() + days * 86400000).toUTCString();
        document.cookie = `${name}=${value}; expires=${expires}; path=/`;
    },

    getCookie(name) {
        const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
        return match ? match[2] : null;
    },

    deleteCookie(name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    },

    // Shared logging
    log(message) {
        console.log(`[Fox] ${message}`);
    },

    // Shared event system
    events: {},

    on(event, callback) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(callback);
    },

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(cb => cb(data));
        }
    }
};
