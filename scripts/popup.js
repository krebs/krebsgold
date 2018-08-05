"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AffiliateIdsHandler = function () {
  function AffiliateIdsHandler(chrome) {
    var _this = this;

    var loadCallback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    _classCallCheck(this, AffiliateIdsHandler);

    this._chrome = chrome;
    this._loadCallback = loadCallback;

    this._chrome.runtime.onStartup.addListener(function () {
      _this.loadDatabase();
    });
    this._chrome.storage.onChanged.addListener(function (changes, namespace) {
      _this.loadDatabase();
    });
    this.loadDatabase();
  }

  _createClass(AffiliateIdsHandler, [{
    key: "setupLoadCallback",
    value: function setupLoadCallback(loadCallback) {
      this._loadCallback = loadCallback;
    }
  }, {
    key: "loadDatabase",
    value: function loadDatabase() {
      var _this2 = this;

      this._chrome.storage.sync.get('runtime', function (data) {
        if (data.runtime) _this2._runtime = data.runtime;
        if (_this2._loadCallback) _this2._loadCallback(_this2);
      });
    }
  }, {
    key: "getAffiliateIds",
    value: function getAffiliateIds(countryCode) {
      if (this._runtime) return this._runtime[countryCode].ids;else return [];
    }
  }, {
    key: "removeAffiliateId",
    value: function removeAffiliateId(countryCode, id) {
      for (var i = 0; i < this._runtime[countryCode].ids.length; i++) {
        if (this._runtime[countryCode].ids[i].id == id) {
          this._runtime[countryCode].ids.splice(i, 1);
          this._saveState();
        }
      }
    }
  }, {
    key: "addAffiliateId",
    value: function addAffiliateId(countryCode, name, affiateId) {
      /**
       * some validation
       */
      if (name.replace(/\s/g, "") == "") return 1;
      if (affiateId.replace(/\s/g, "") == "") return 2;
      if (this.isConfiguredId(countryCode, affiateId)) return 2;
      /**
       * Affilate IDs have to contain a -
       */
      if (affiateId.indexOf("-") == -1) return 2;
      /**
       * No whitespace allowed in affiliate-id
       */
      affiateId = affiateId.replace(/\s/g, '');

      var affiliateIdObject = {
        'name': name,
        'id': affiateId
      };
      this._runtime[countryCode].ids.push(affiliateIdObject);
      this._saveState();
      return 0;
    }
  }, {
    key: "isConfiguredId",
    value: function isConfiguredId(countryCode, affiliateId) {
      for (var i = 0; i < this._runtime[countryCode].ids.length; i++) {
        if (this._runtime[countryCode].ids[i].id == affiliateId) return true;
      }return false;
    }
  }, {
    key: "setPreventOverwrite",
    value: function setPreventOverwrite(prevent) {
      this._runtime.config = {
        'prevent': prevent ? true : false
      };

      this._saveState();
      return prevent ? true : false;
    }
  }, {
    key: "getPreventOverwrite",
    value: function getPreventOverwrite() {
      if (this._runtime)
        //return this._runtime.config?.prevent ? this._runtime.config.prevent : false;
        return this._runtime.config ? this._runtime.config.prevent ? this._runtime.config.prevent : false : false;else return false;
    }
  }, {
    key: "_saveState",
    value: function _saveState() {
      this._chrome.storage.sync.set({ 'runtime': this._runtime });
    }
  }]);

  return AffiliateIdsHandler;
}();

var OptionsMenu = function () {
  function OptionsMenu(affiliateIdsHandler) {
    _classCallCheck(this, OptionsMenu);

    this._affiliateIdsHandler = affiliateIdsHandler;
    this._affiliateIdsHandler.loadDatabase();
    this._affiliateIdsHandler.setupLoadCallback(this._renderTable);
    this.showCountryConfiguration(this.getCountryCode());
    this.setupClickHandler();
  }

  _createClass(OptionsMenu, [{
    key: "clickHandler",
    value: function clickHandler(element) {
      var countryCode = this.getCountryCode();
      /**
       * Check for frontend validation
       */
      if ($('#' + countryCode + ' .input-field #name').hasClass("invalid") || $('#' + countryCode + ' .input-field #Affiliate_Id').hasClass("invalid")) {
        return;
      }
      /**
       * Reset Validation
       */
      $('#' + countryCode + ' .input-field #name').removeClass("invalid");
      $('#' + countryCode + ' .input-field #Affiliate_Id').removeClass("invalid");
      $('#' + countryCode + ' .input-field #name').removeClass("valid");
      $('#' + countryCode + ' .input-field #Affiliate_Id').removeClass("valid");

      var name = $('#' + countryCode + ' .input-field #name').val();
      var affiliateId = $('#' + countryCode + ' .input-field #Affiliate_Id').val();

      switch (this._affiliateIdsHandler.addAffiliateId(countryCode, name, affiliateId)) {
        case 1:
          $('#' + countryCode + ' .input-field #name').addClass("invalid");
          break;
        case 2:
          $('#' + countryCode + ' .input-field #Affiliate_Id').addClass("invalid");
          break;
        default:
          $('#' + countryCode + ' .input-field #name').val("");
          $('#' + countryCode + ' .input-field #Affiliate_Id').val("");
      }
      $('#' + countryCode + ' .input-field #name').focus();
    }
  }, {
    key: "showCountryConfiguration",
    value: function showCountryConfiguration(countryCode) {
      var countryCard = $('#templates .card').clone();
      var jumpToLink = countryCard.find('.jumptolink');

      jumpToLink.attr('href', OptionsMenu.associatePrograms[countryCode].url);
      jumpToLink.text(jumpToLink.text().replace("###AMAZONNAME###", OptionsMenu.associatePrograms[countryCode].name));
      $('#' + countryCode).empty();
      $('#' + countryCode).append(countryCard);
      $('#' + countryCode + ' .input-field #name').focus();
      this._renderTable(this._affiliateIdsHandler, countryCode);
      this.setupClickHandler();
    }
  }, {
    key: "getCountryCode",
    value: function getCountryCode() {
      return $('.tabs a.active').attr('href').replace("#", "");
    }
  }, {
    key: "setupClickHandler",
    value: function setupClickHandler() {
      var _this3 = this;

      /**
       * setup click handler for tab change
       */
      $('.tab a').unbind('click');
      $('.tab a').click(function (e) {
        var countryCode = e.currentTarget.hash.replace("#", "");
        _this3.showCountryConfiguration(countryCode);
      });

      $(document).unbind('keypress');
      $(document).keypress(function (event) {
        var keycode = event.keyCode || event.which;
        if (keycode == '13') _this3.clickHandler($('.insert-new-affiliate-id'));
      });

      $('.insert-new-affiliate-id').unbind('click');
      $('.insert-new-affiliate-id').click(function (e) {
        _this3.clickHandler(e.currentTarget);
      });

      $('#Override_Tag_Cb').unbind('click');
      $('#Override_Tag_Cb').click(function (e) {
        var prev = _this3._affiliateIdsHandler.setPreventOverwrite($('#Override_Tag').prop('checked'));
      });
    }
  }, {
    key: "_renderTable",
    value: function _renderTable(affiliateIdsHandler, countryCodeGiven) {
      var countryCode = $('.tabs a.active').attr('href').replace("#", "");
      if (countryCodeGiven) countryCode = countryCodeGiven;

      var affiliateIds = affiliateIdsHandler.getAffiliateIds(countryCode);

      $('#' + countryCode + ' .card .card-content .affiliate-list .table-content').empty();

      affiliateIds.forEach(function (element) {
        var table_entry = $('#templates .table-entry').clone();

        table_entry.children('.affiliate-name').text(element.name);
        table_entry.children('.affiliate-id').text(element.id);
        table_entry.find('.affiliate-jump-to-amazon a').attr('href', OptionsMenu.associatePrograms[countryCode].url + '/?tag=' + element.id);
        $('#' + countryCode + ' .card .card-content .affiliate-list .table-content').append(table_entry);
        $(table_entry).find('.affiliate-remove').click(function (e) {
          affiliateIdsHandler.removeAffiliateId(countryCode, $(e.currentTarget).parent().find(".affiliate-id").text());
        });
      });

      var prevent = affiliateIdsHandler.getPreventOverwrite() ? true : false;
      $('#Override_Tag').prop('checked', prevent);
    }
  }]);

  return OptionsMenu;
}();

OptionsMenu.associatePrograms = {
  'de': {
    "name": "www.amazon.de",
    "url": "https://www.amazon.de"
  },
  'uk': {
    "name": "www.amazon.co.uk",
    "url": "https://www.amazon.co.uk"
  },
  'us': {
    "name": "www.amazon.com",
    "url": "https://www.amazon.com"
  },
  'fr': {
    "name": "www.amazon.fr",
    "url": "https://www.amazon.fr"
  },
  'jp': {
    "name": "www.amazon.co.jp",
    "url": "https://www.amazon.co.jp"
  },
  'ca': {
    "name": "www.amazon.ca",
    "url": "https://www.amazon.ca"
  },
  'cn': {
    "name": "www.amazon.cn",
    "url": "https://www.amazon.cn"
  },
  'it': {
    "name": "www.amazon.it",
    "url": "https://www.amazon.it"
  },
  'es': {
    "name": "www.amazon.es",
    "url": "https://www.amazon.es"
  },
  'in': {
    "name": "www.amazon.in",
    "url": "https://www.amazon.in"
  },
  'br': {
    "name": "www.amazon.com.br",
    "url": "https://www.amazon.com.br"
  }
};


$(function () {
  var optionsMenu = new OptionsMenu(new AffiliateIdsHandler(chrome));
});
