function function_carrega_popup_imgs(game) {
    if (game === undefined || game === null) return;
    const actualfile = new Date().valueOf();
    const popup = document.getElementById("popup");
    const popupcontent = document.getElementById("popupcontent");
    if(!popup || !popupcontent) return;
    popup.style.display = "block";

    // adiciona handler para ESC para fechar o popup
    function _escHandler(e){ if(e.key === 'Escape') function_close_popup(); }
    document.addEventListener('keydown', _escHandler);
    // armazenar referência para remoção posterior
    popup._escHandler = _escHandler;

    const sanitizeLink = (href)=>{
        if(!href) return null;
        href = String(href).trim();
        if(href.match(/^https?:\/\//i) || href.startsWith('//')) return href;
        if(href.startsWith('/')) return href; // absolute on server
        // relative to project content folder
        return `content/${game}/${href}`;
    };

    // Função de fallback que exibe o slideshow (com refresh)
    const showSlideshowFallback = ()=>{
        popupcontent.innerHTML = '<object style="width:100%; height: 90%;" type="text/html" data="slideshow.html?selgame=' + game + '&refresh=' + actualfile + '"></object>';
    };

    // Tenta carregar meta.json dentro da pasta content/<game>/meta.json
    fetch(`content/${game}/meta.json`).then(resp=>{
        if(!resp.ok) throw 0;
        return resp.json();
    }).then(meta=>{
        const title = meta.title || meta.name || (`Game ${game}`);
        const desc = meta.description || meta.short || '';
        let html = '';
        html += `<div style="display:flex;flex-direction:column;height:100%">`;
        html += `<div style="padding-bottom:8px;"><h2 style=\"margin:0;color:#fff\">${title}</h2><p style=\"margin:0;color:#cbd5e1\">${desc}</p></div>`;
        html += `<div style=\"flex:1;display:flex;gap:12px;align-items:stretch;\">`;
        // área principal (preferir index.html se existir, senão slideshow)
        html += `<div id=\"popup-main-area\" style=\"flex:1;min-width:0;\"></div>`;
        // painel lateral com links/infos
        html += `<div style=\"width:280px;background:#07101a;padding:12px;border-radius:8px;color:#cbd5e1;overflow:auto;\">`;
        if(meta.links && Array.isArray(meta.links)){
            html += '<h6 style="margin-top:0;color:#fff">Links</h6><ul style="padding-left:18px">';
            meta.links.forEach(l=>{
                const href = sanitizeLink(l.url || l.href || l.link);
                if(!href) return;
                const label = l.label || l.name || href;
                html += `<li style="margin-bottom:6px"><a href="${href}" target="_blank" rel="noopener noreferrer" style="color:#8fd3ff">${label}</a></li>`;
            });
            html += '</ul>';
        }
        // link direto para página do projeto (index.html) - exibido se existir
        html += `<div style="margin-top:8px"><a id=\"popup-open-index\" href=\"#\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color:#9fe3ff\">Abrir página do projeto</a></div>`;
        if(meta.extra){ html += `<div style="margin-top:8px">${meta.extra}</div>`; }
        html += `</div>`;
        html += `</div></div>`;
        popupcontent.innerHTML = html;

        // agora, preferir carregar content/<game>/index.html no main area se existir
        fetch(`content/${game}/index.html`, {method:'HEAD'}).then(r=>{
            const mainArea = document.getElementById('popup-main-area');
            if(r.ok && mainArea){
                mainArea.innerHTML = `<object style="width:100%; height:100%; border-radius:8px; overflow:hidden;" type="text/html" data="content/${game}/index.html"></object>`;
                const openIndexLink = document.getElementById('popup-open-index');
                if(openIndexLink) openIndexLink.href = `content/${game}/index.html`;
            } else if(mainArea){
                // se não houver index, carregar slideshow
                mainArea.innerHTML = `<object style="width:100%; height:100%; border-radius:8px; overflow:hidden;" type="text/html" data="slideshow.html?selgame=${game}&refresh=${actualfile}"></object>`;
                const openIndexLink = document.getElementById('popup-open-index');
                if(openIndexLink) openIndexLink.style.display = 'none';
            }
        }).catch(()=>{
            const mainArea = document.getElementById('popup-main-area');
            if(mainArea) mainArea.innerHTML = `<object style="width:100%; height:100%; border-radius:8px; overflow:hidden;" type="text/html" data="slideshow.html?selgame=${game}&refresh=${actualfile}"></object>`;
            const openIndexLink = document.getElementById('popup-open-index');
            if(openIndexLink) openIndexLink.style.display = 'none';
        });
    }).catch(()=>{
        // se não houver meta.json, tentar index.html diretamente
        fetch(`content/${game}/index.html`, {method:'HEAD'}).then(r=>{
            if(r.ok){
                popupcontent.innerHTML = `<object style="width:100%; height: 100%;" type="text/html" data="content/${game}/index.html"></object>`;
            } else {
                showSlideshowFallback();
            }
        }).catch(()=>{
            showSlideshowFallback();
        });
    });
}

function function_close_popup() {
    const popup = document.getElementById("popup");
    const popupcontent = document.getElementById("popupcontent");
    if(popup){
        popup.style.display = "none";
        // limpar conteúdo para parar mídias/iframes
        if(popupcontent) popupcontent.innerHTML = '';
        // remover esc handler se existe
        if(popup._escHandler){ document.removeEventListener('keydown', popup._escHandler); delete popup._escHandler; }
    }
}

