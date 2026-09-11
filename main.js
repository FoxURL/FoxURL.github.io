(() => {
	const path = window.location.pathname;
	const isAppPage = /\/app\/?$/.test(path);
	const isRouterPage = /(^|\/)index\.html?$/.test(path) && path === "/";
	const description = isAppPage
		? "FoxURL cloud applications and digital infrastructure."
		: isRouterPage
			? "Choose your FoxURL regional site."
			: "FoxURL builds digital infrastructure and cloud applications for a more connected web.";

	const upsertMeta = (attribute, key, content) => {
		let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
		if (!element) {
			element = document.createElement("meta");
			element.setAttribute(attribute, key);
			document.head.appendChild(element);
		}
		element.setAttribute("content", content);
	};

	const upsertLink = (rel, href) => {
		let element = document.head.querySelector(`link[rel="${rel}"]`);
		if (!element) {
			element = document.createElement("link");
			element.rel = rel;
			document.head.appendChild(element);
		}
		element.href = href;
	};

	upsertMeta("name", "description", description);
	upsertMeta("name", "theme-color", "#190a02");
	upsertLink("manifest", "/site.webmanifest");
	upsertLink("icon", "/assets/logo/favicon.png");
	upsertLink("canonical", window.location.href.split("#")[0]);
	upsertMeta("property", "og:title", document.title || "FoxURL");
	upsertMeta("property", "og:description", description);
	upsertMeta("property", "og:url", window.location.href.split("#")[0]);

	if (!document.head.querySelector('meta[name="viewport"]')) {
		upsertMeta("name", "viewport", "width=device-width, initial-scale=1");
	}

	if (isAppPage) {
		upsertMeta("name", "apple-mobile-web-app-capable", "yes");
		upsertMeta("name", "apple-mobile-web-app-status-bar-style", "black-translucent");
		upsertMeta("name", "apple-mobile-web-app-title", "FoxURL");
		upsertLink("apple-touch-icon", "/assets/logo/circular.png");
	}

	const regionalButton = document.querySelector(".regional-button");
	if (regionalButton) {
		const menu = document.createElement("nav");
		menu.id = "regional-menu";
		menu.className = "regional-menu";
		menu.setAttribute("aria-label", "Choose a regional site");
		menu.hidden = true;
		menu.innerHTML = '<a href="/en/">International</a><a href="/au/">Australia</a><a href="/eu/">Europe</a><a href="/uk/">United Kingdom</a>';
		document.body.appendChild(menu);

		const closeMenu = () => {
			menu.hidden = true;
			regionalButton.setAttribute("aria-expanded", "false");
		};
		regionalButton.addEventListener("click", () => {
			menu.hidden = !menu.hidden;
			regionalButton.setAttribute("aria-expanded", String(!menu.hidden));
		});
		document.addEventListener("click", (event) => {
			if (!menu.contains(event.target) && event.target !== regionalButton) closeMenu();
		});
		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape") closeMenu();
		});
	}
})();
