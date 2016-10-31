if (!document) {
    throw Error("electron-tabs module must be called in renderer process");
}

// Inject styles
(function () {
    const styles = `
        webview {
            display: flex;
            flex: 0 1;
            width: 0px;
            height: 0px;
        }
        webview.visible {
            width: 100%;
            height: 100%;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
        }
    `;
    let styleTag = document.createElement("style");
    styleTag.innerHTML = styles;
    document.getElementsByTagName("head")[0].appendChild(styleTag);
})();

class TabGroup {
    constructor (args) {
        this.tabContainerSelector = args.tabContainerSelector;
        this.tabContainer = document.querySelector(this.tabContainerSelector);
        this.viewContainerSelector = args.viewContainerSelector;
        this.viewContainer = document.querySelector(this.viewContainerSelector);
        this.tabs = [];
        this.newTabId = 0;
    }

    addTab (args) {
        let id = this.newTabId;
        this.newTabId++;
        let tab = new Tab(this, id, args);
        this.pushTab(tab);
        return tab;
    }

    pushTab (tab) {
        this.tabs.push(tab);
    }

    removeTab (tab) {
        let id = tab.id;
        for (let i in this.tabs) {
            if (this.tabs[i].id === id) {
                this.tabs.splice(i, 1);
                break;
            }
        }
    }

    setActiveTab (tab) {
        this.removeTab(tab);
        this.pushTab(tab);
    }

    getActiveTab () {
        if (this.tabs.length < 1) return null;
        return this.tabs[this.tabs.length - 1];
    }

    activateRecentTab (tab) {
        let recentTab = this.tabs[this.tabs.length - 1];
        if (!recentTab) return;
        recentTab.activate();
    }
}

class Tab {
    constructor (tabGroup, id, args) {
        this.tabGroup = tabGroup;
        this.id = id;
        this.title = args.title;
        this.iconURL = args.iconURL;
        this.webviewAttributes = args.webviewAttributes || {};
        this.webviewAttributes.src = args.src;
        this.initTab();
        this.initWebview();
    }

    initTab () {
        this.tab = document.createElement("div");
        this.setTitle(this.title);
        this.tab.addEventListener("click", this.activate.bind(this), false);
        this.tabGroup.tabContainer.appendChild(this.tab);
        // TODO: close button
        // TODO: handle middle click
    }

    initWebview () {
        this.webview = document.createElement("webview");
        if (this.webviewAttributes) {
            let attrs = this.webviewAttributes;
            for (let key in attrs) {
                this.webview.setAttribute(key, attrs[key]);
            }
        }
        this.tabGroup.viewContainer.appendChild(this.webview);
    }

    setTitle (title) {
        this.title = title;
        this.tab.innerHTML = title;
    }

    getTitle () {
        return this.tab.innerHTML;
    }

    setIcon (iconURL) {
        this.iconURL = iconURL;
        this.tab.setAttribute("data-icon", iconURL);
    }

    activate () {
        let activeTab = this.tabGroup.getActiveTab();
        if (activeTab) {
            activeTab.tab.classList.remove("active");
            activeTab.webview.classList.remove("visible");
        }
        this.tabGroup.setActiveTab(this);
        this.tab.classList.add("active");
        this.webview.classList.add("visible");
    }

    flash (flag) {
        if (flag) {
            this.tab.classList.add("flash");
        } else {
            this.tab.classList.remove("flash");
        }
    }

    move (index) {
        // TODO: move
    }

    close () {
        this.tabContainer.removeChild(this.tab);
        this.tabGroup.viewContainer.removeChild(this.webview);
        this.tabGroup.removeTab(this);
        this.tabGroup.activateRecentTab();
    }
}

module.exports = TabGroup;