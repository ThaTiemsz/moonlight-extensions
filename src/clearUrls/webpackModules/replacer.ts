import Commands from "@moonlight-mod/wp/commands_commands";

const defaultRules = [
  "action_object_map",
  "action_type_map",
  "action_ref_map",
  "spm@*.aliexpress.com",
  "scm@*.aliexpress.com",
  "aff_platform",
  "aff_trace_key",
  "algo_expid@*.aliexpress.*",
  "algo_pvid@*.aliexpress.*",
  "btsid",
  "ws_ab_test",
  "pd_rd_*@amazon.*",
  "_encoding@amazon.*",
  "psc@amazon.*",
  "tag@amazon.*",
  "ref_@amazon.*",
  "pf_rd_*@amazon.*",
  "pf@amazon.*",
  "crid@amazon.*",
  "keywords@amazon.*",
  "sprefix@amazon.*",
  "sr@amazon.*",
  "ie@amazon.*",
  "node@amazon.*",
  "qid@amazon.*",
  "callback@bilibili.com",
  "cvid@bing.com",
  "form@bing.com",
  "sk@bing.com",
  "sp@bing.com",
  "sc@bing.com",
  "qs@bing.com",
  "pq@bing.com",
  "sc_cid",
  "mkt_tok",
  "trk",
  "trkCampaign",
  "ga_*",
  "gclid",
  "gclsrc",
  "hmb_campaign",
  "hmb_medium",
  "hmb_source",
  "spReportId",
  "spJobID",
  "spUserID",
  "spMailingID",
  "itm_*",
  "s_cid",
  "elqTrackId",
  "elqTrack",
  "assetType",
  "assetId",
  "recipientId",
  "campaignId",
  "siteId",
  "mc_cid",
  "mc_eid",
  "pk_*",
  "sc_campaign",
  "sc_channel",
  "sc_content",
  "sc_medium",
  "sc_outcome",
  "sc_geo",
  "sc_country",
  "utm_*",
  "nr_email_referer",
  "vero_conv",
  "vero_id",
  "yclid",
  "_openstat",
  "mbid",
  "cmpid",
  "cid",
  "c_id",
  "campaign_id",
  "Campaign",
  "hash@ebay.*",
  "igsh",
  "fb_action_ids",
  "fb_action_types",
  "fb_ref",
  "fb_source",
  "fbclid",
  "refsrc@facebook.com",
  "hrc@facebook.com",
  "gs_l",
  "gs_lcp@google.*",
  "ved@google.*",
  "ei@google.*",
  "sei@google.*",
  "gws_rd@google.*",
  "gs_gbg@google.*",
  "gs_mss@google.*",
  "gs_rn@google.*",
  "_hsenc",
  "_hsmi",
  "__hssc",
  "__hstc",
  "hsCtaTracking",
  "pf_rd_*@imdb.com",
  "ref_@imdb.com",
  "_branch_match_id@medium.com",
  "source@medium.com",
  "source@sourceforge.net",
  "position@sourceforge.net",
  "context@open.spotify.com",
  "si@open.spotify.com",
  "_d@tiktok.com",
  "checksum@tiktok.com",
  "is_copy_url@tiktok.com",
  "is_from_webapp@tiktok.com",
  "language@tiktok.com",
  "preview_pb@tiktok.com",
  "sec_user_id@tiktok.com",
  "sender_device@tiktok.com",
  "sender_web_id@tiktok.com",
  "share_app_id@tiktok.com",
  "share_link_id@tiktok.com",
  "share_item_id@tiktok.com",
  "source@tiktok.com",
  "timestamp@tiktok.com",
  "tt_from@tiktok.com",
  "u_code@tiktok.com",
  "user_id@tiktok.com",
  "cxt@*.twitter.com",
  "t@*.twitter.com",
  "s@*.twitter.com",
  "ref_*@*.twitter.com",
  "cxt@*.x.com",
  "t@*.x.com",
  "s@*.x.com",
  "ref_*@*.x.com",
  "twclid",
  "tt_medium",
  "tt_content",
  "lr@yandex.*",
  "redircnt@yandex.*",
  "feature@youtu.be",
  "kw@youtu.be",
  "pp@youtu.be",
  "si@youtu.be",
  "attr_tag@youtube.com",
  "feature@youtube.com",
  "kw@youtube.com",
  "parentCsn@youtube.com",
  "parentTrackingParams@youtube.com",
  "pp@youtube.com",
  "si@youtube.com",
  "wt_zmc"
];

// rules taken from https://github.com/Smile4ever/Neat-url#default-blocked-parameters

const useDefaultRules = moonlight.getConfigOption<boolean>("clearUrls", "useDefaultRules");
const configRules = moonlight.getConfigOption<string[]>("clearUrls", "rules");

let rules: string[] = [];
const universalRules = new Set<string | RegExp>();
const rulesByHost = new Map<string, Set<string | RegExp>>();
const hostRules = new Map<string, RegExp>();

// Strict matching for false
if (useDefaultRules !== false) {
  rules = rules.concat(defaultRules);
}
if (configRules) {
  rules = rules.concat(configRules);
}

const reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
const reHasRegExpChar = RegExp(reRegExpChar.source);

function escapeRegExp(str: string) {
  return str && reHasRegExpChar.test(str) ? str.replace(reRegExpChar, "\\$&") : str || "";
}

function parseRules() {
  for (const rule of rules) {
    const splitRule = rule.split("@");

    let paramRule: string | RegExp = splitRule[0];
    if (paramRule.indexOf("*") !== -1)
      paramRule = new RegExp("^" + escapeRegExp(splitRule[0]).replace(/\\\*/, ".+?") + "$");

    if (!splitRule[1]) {
      universalRules.add(paramRule);
      continue;
    }

    const hostRule = new RegExp(
      "^(www\\.)?" +
        escapeRegExp(splitRule[1])
          .replace(/^\\\*\\\./, "(.+?\\.)?")
          .replace(/\\\*/, ".+?") +
        "$"
    );

    const hostRuleIndex = hostRule.toString();

    hostRules.set(hostRuleIndex, hostRule);
    if (rulesByHost.get(hostRuleIndex) == null) {
      rulesByHost.set(hostRuleIndex, new Set());
    }
    rulesByHost.get(hostRuleIndex)?.add(paramRule);
  }
}

function removeParam(rule: string | RegExp, param: string, parent: URLSearchParams) {
  if (param === rule || (rule instanceof RegExp && rule.test(param))) {
    parent.delete(param);
  }
}

function replacer(match: string) {
  let url;
  try {
    url = new URL(match);
  } catch {
    // Don't modify anything if we can't parse the URL
    return match;
  }

  // Cheap way to check if there are any search params
  if (url.searchParams.entries().next().done) {
    // If there are none, we don't need to modify anything
    return match;
  }

  // Check all universal rules
  universalRules.forEach((rule) => {
    url.searchParams.forEach((_value, param, parent) => {
      removeParam(rule, param, parent);
    });
  });

  // Check rules for each hosts that match
  hostRules.forEach((regex, hostRuleName) => {
    if (!regex.test(url.hostname)) return;
    rulesByHost.get(hostRuleName)?.forEach((rule) => {
      url.searchParams.forEach((_value, param, parent) => {
        removeParam(rule, param, parent);
      });
    });
  });

  return url.toString();
}

parseRules();

Commands.registerLegacyCommand("clearUrls", {
  match: /http(s)?:\/\//,
  action: (content) => {
    content = content.replace(/(https?:\/\/[^\s<]+[^<.,:;"'>)|\]\s])/g, replacer);
    return { content };
  }
});
