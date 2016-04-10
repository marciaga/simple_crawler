import cheerio from 'cheerio';
import request from 'request';
import URL from 'url-parse';

const START_URL = 'http://arstechnica.com';
const SEARCH_TERM = 'snuffy';
const MAX_PAGES_TO_VISIT = 20;

let pagesVisited = new Set(),
    numPagesVisited = 0,
    pagesToVisit = [],
    url = new URL(START_URL),
    baseUrl = `${url.protocol}//${url.hostname}`;

pagesToVisit.push(START_URL);
crawl();

function crawl() {
    if (numPagesVisited >= MAX_PAGES_TO_VISIT) {
        console.log('Reached maximum pages');
        return null;
    }
    let nextPage = pagesToVisit.pop();

    if (nextPage in pagesVisited) {
        crawl();
    } else {
        visitPage(nextPage, crawl);
    }
}

function visitPage(url, callback) {
    pagesVisited[url] = true;
    numPagesVisited++;

    console.log(`Visiting page ${url}...`);
    request(url, function(err, res, body) {
        if (err) {
            console.log(`Error: ${err}`);
            return null;
        }

        console.log(`Status code: ${res.statusCode}`);

        if (res.statusCode === 200) {
            let $ = cheerio.load(body),
                isWordFound = searchTextForTerm($, SEARCH_TERM);

            if (isWordFound) {
                console.log(`Word ${SEARCH_TERM} found at page ${url}`);
            } else {
                collectInternalLinks($);
                callback();
            }
        }
    });
}

function searchTextForTerm($, term) {
    let bodyText = $('html > body').text().toLowerCase();
    return (bodyText.indexOf(term.toLowerCase()) !== -1);
}

function collectInternalLinks($) {
    let relativeLinks = $("a[href^='/']");
    console.log(`Found ${relativeLinks.length} relative links on page.`);

    relativeLinks.each(function() {
        let link = $(this).attr('href');
        pagesToVisit.push(baseUrl + link);
    });

}
