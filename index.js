const dl_btn = document.querySelector("button[data-iapp-action='download']");
const progressbar = document.querySelector("*[data-iapp-action='progressbar']");

/**
 * 
 * @param {Blob} blob 
 */
const open_download_link = (blob) =>
{
    const a = document.createElement("a");
    // Attributes
    a.href = URL.createObjectURL(blob);
    a.download = "download.mp3";
    a.style.display = "none";
    // *click* *click* *click*
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

/**
 * 
 * @param {Number} loaded 
 * @param {Number} total 
 */
const update_progressbar = (loaded, total) => {
    progressbar.style.width = `${Math.round( loaded / total * 100)}%`;
    progressbar.hidden = false;
};

/**
 * @param {String} path 
 */
const open_download = (path = "/") =>
{
    const ajax = fetch(path);
    ajax.then((response) =>
    {
        if (!response.ok)
        {
            throw new Error(`Failed to download MP3: ${url}`);
        }
        const get_total = (response) =>
        {
            const image_length = response.headers.get("content-length");
            return parseInt(image_length, 10);
        }
        let downloaded = 0;
        const res = new Response(new ReadableStream({
            async start(controller) {
                const total = get_total(response);
                const reader = response.body.getReader();
                for (; ;) {
                    const { done, value } = await reader.read();
                    if (done) {
                        break;
                    }
                    downloaded += value.byteLength;
                    update_progressbar(downloaded, total);
                    controller.enqueue(value);
                }
                controller.close();
            },
        }));
        return res.blob();
    }).then(open_download_link).catch( up => { throw up });
};

dl_btn.addEventListener( "click", (event) =>
{
    const dom = event.target;
    open_download(dom.dataset.iappDownloadpath);
});

const get_help  = document.querySelector("*[data-iapp-action='get-help']");
const help_area = document.querySelector("*[data-iapp-render='get-help']");

get_help.addEventListener("click", () => {
    if( help_area.innerHTML.trim().length > 0 )
    {
        return;
    }
    const ajax = fetch("./README.md").then(r=>r.text());
    ajax.then( (content) => {
        help_area.innerHTML = window.markdownit().render( content );
    });
});

