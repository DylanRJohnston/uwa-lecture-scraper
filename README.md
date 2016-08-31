# UWA Lecture Capture System Scraper

This is a scraper in progress for UWA's lecture capture system. It crawls the index page and allows students to watch lectures from units in previous semesters and download lectures for watching offline.

## Instructions
Right now only the unit scraper is working again.

* Download this project `git clone https://github.com/DylanRJohnston/uwa-lecture-scraper.git`
* cd in directory `cd uwa-lecture-scraper`
* Install dependencies `npm i`
* Scrape units `lcs index`

There will now be a `units.json` file containing a json object with all the unit information. Can be inspected with a tool like `jq` e.g. `<units.json jq '.[] | select(.identifier == "PHYS1001") | {name, portal_url}'`
```json
{
  "name": "Physics for Scientists and Engineers Standard semester 1 2014 [155149]",
  "portal_url": "http://prod.lcs.uwa.edu.au:8080/ess/portal/section/155149"
}
{
  "name": "Physics for Scientists and Engineers Standard semester 1 2016 [178733]",
  "portal_url": "http://prod.lcs.uwa.edu.au:8080/ess/portal/section/178733"
}
{
  "name": "Physics for Scientists and Engineers Standard semester 1 2015 [166139]",
  "portal_url": "http://prod.lcs.uwa.edu.au:8080/ess/portal/section/166139"
}
{
  "name": "Physics for Scientists and Engineers Standard semester 1 2013 [146197]",
  "portal_url": "http://prod.lcs.uwa.edu.au:8080/ess/portal/section/146197"
}
{
  "name": "Physics for Scientists and Engineers Standard semester 1 2012 [141233]",
  "portal_url": "http://prod.lcs.uwa.edu.au:8080/ess/portal/section/141233"
}
```

## 2.0 Rewrite (In progress)
- [x] Rewrite unit scraper
- [x] Rewrite async logic to use coroutines and promises.
- [x] Improve rate limiting logic
- [ ] Improve scraping logic to only pull updates
- [ ] Reimplement lecture scraper
- [ ] Figure out the new m3u8 format
- [ ] Create a web GUI
- [ ] Make idiot proof
