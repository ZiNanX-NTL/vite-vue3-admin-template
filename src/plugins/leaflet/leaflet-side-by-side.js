L.Control.SideBySide = L.Control.extend({
  mapWasDragEnabled: false,
  mapWasTapEnabled: false,
  options: {
    thumbSize: 42,
    padding: 0,
    // iclient 卷帘方向参数,可以设值leftright和updown
    // leftright:左右卷帘，updown:上下卷帘
    sbsctrdirection: ''
  },
  initialize(leftLayers, rightLayers, options) {
    this.setGloalStyle(options.sbsctrdirection);
    this.setLeftLayers(leftLayers);
    this.setRightLayers(rightLayers);
    L.setOptions(this, options);
  },
  // Leaflet v0.7 backwards compatibility
  on(el, types, fn, context) {
    types.split(' ').forEach(function (type) {
      L.DomEvent.on(el, type, fn, context);
    });
  },

  // Leaflet v0.7 backwards compatibility
  off(el, types, fn, context) {
    types.split(' ').forEach(function (type) {
      L.DomEvent.off(el, type, fn, context);
    });
  },

  getRangeEvent(rangeInput) {
    return 'oninput' in rangeInput ? 'input' : 'change';
  },

  cancelMapDrag() {
    this.mapWasDragEnabled = this._map.dragging.enabled();
    this.mapWasTapEnabled = this._map.tap && this._map.tap.enabled();
    this._map.dragging.disable();
    this._map.tap && this._map.tap.disable();
  },

  uncancelMapDrag(e) {
    this._refocusOnMap(e);
    if (this.mapWasDragEnabled) {
      this._map.dragging.enable();
    }
    if (this.mapWasTapEnabled) {
      this._map.tap.enable();
    }
  },

  // convert arg to an array - returns empty array if arg is undefined
  asArray(arg) {
    return arg === 'undefined' ? [] : Array.isArray(arg) ? arg : [arg];
  },

  // iclient 设置全局style
  setGloalStyle(sbsctrdirection) {
    this._sbsctrdirection = sbsctrdirection;
    var cssrl = '';
    var csstb = '';
    switch (this._sbsctrdirection) {
      case 'leftright':
        var cssrl =
          '.leaflet-sbs-divider {\r\n    position: absolute;\r\n    top: 0;\r\n    bottom: 0;\r\n    left: 50%;\r\n    margin-left: -2px;\r\n    width: 4px;\r\n    height:100%;\r\n    background-color: #fff;\r\n    pointer-events: none;\r\n    z-index: 999;\r\n}\r\n.leaflet-sbs-range {\r\n    position: absolute;\r\n    top: 50%;\r\n    width: 100%;\r\n    transform: unset;\r\n    -webkit-appearance: none;\r\n    display: inline-block!important;\r\n    vertical-align: middle;\r\n    height: 0;\r\n    padding: 0;\r\n    margin: 0;\r\n    border: 0;\r\n    background: rgba(0, 0, 0, 0.25);\r\n    min-width: 100px;\r\n    cursor: pointer;\r\n    pointer-events: none;\r\n    z-index: 999;\r\n}\r\n.leaflet-sbs-range::-ms-fill-upper {\r\n    background: transparent;\r\n}\r\n.leaflet-sbs-range::-ms-fill-lower {\r\n    background: rgba(255, 255, 255, 0.25);\r\n}\r\n/* Browser thingies */\r\n\r\n.leaflet-sbs-range::-moz-range-track {\r\n    opacity: 0;\r\n}\r\n.leaflet-sbs-range::-ms-track {\r\n    opacity: 0;\r\n}\r\n.leaflet-sbs-range::-ms-tooltip {\r\n    display: none;\r\n}\r\n/* For whatever reason, these need to be defined\r\n * on their own so dont group them */\r\n\r\n.leaflet-sbs-range::-webkit-slider-thumb {\r\n    -webkit-appearance: none;\r\n    margin: 0;\r\n    padding: 0;\r\n    background: #fff;\r\n    height: 40px;\r\n    width: 40px;\r\n    border-radius: 20px;\r\n    cursor: ew-resize;\r\n    pointer-events: auto;\r\n    border: 1px solid #ddd;\r\n    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAABlBMVEV9fX3///+Kct39AAAAAnRSTlP/AOW3MEoAAAA9SURBVFjD7dehDQAwDANBZ/+l2wmKoiqR7pHRcaeaCxAIBAL/g7k9JxAIBAKBQCAQCAQC14H+MhAIBE4CD3fOFvGVBzhZAAAAAElFTkSuQmCC");\r\n    background-position: 50% 50%;\r\n    background-repeat: no-repeat;\r\n    background-size: 40px 40px;\r\n}\r\n.leaflet-sbs-range::-ms-thumb {\r\n    margin: 0;\r\n    padding: 0;\r\n    background: #fff;\r\n    height: 40px;\r\n    width: 40px;\r\n    border-radius: 20px;\r\n    cursor: ew-resize;\r\n    pointer-events: auto;\r\n    border: 1px solid #ddd;\r\n    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAABlBMVEV9fX3///+Kct39AAAAAnRSTlP/AOW3MEoAAAA9SURBVFjD7dehDQAwDANBZ/+l2wmKoiqR7pHRcaeaCxAIBAL/g7k9JxAIBAKBQCAQCAQC14H+MhAIBE4CD3fOFvGVBzhZAAAAAElFTkSuQmCC");\r\n    background-position: 50% 50%;\r\n    background-repeat: no-repeat;\r\n    background-size: 40px 40px;\r\n}\r\n.leaflet-sbs-range::-moz-range-thumb {\r\n    padding: 0;\r\n    right: 0    ;\r\n    background: #fff;\r\n    height: 40px;\r\n    width: 40px;\r\n    border-radius: 20px;\r\n    cursor: ew-resize;\r\n    pointer-events: auto;\r\n    border: 1px solid #ddd;\r\n    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAABlBMVEV9fX3///+Kct39AAAAAnRSTlP/AOW3MEoAAAA9SURBVFjD7dehDQAwDANBZ/+l2wmKoiqR7pHRcaeaCxAIBAL/g7k9JxAIBAKBQCAQCAQC14H+MhAIBE4CD3fOFvGVBzhZAAAAAElFTkSuQmCC");\r\n    background-position: 50% 50%;\r\n    background-repeat: no-repeat;\r\n    background-size: 40px 40px;\r\n}\r\n.leaflet-sbs-range:disabled::-moz-range-thumb {\r\n    cursor: default;\r\n}\r\n.leaflet-sbs-range:disabled::-ms-thumb {\r\n    cursor: default;\r\n}\r\n.leaflet-sbs-range:disabled::-webkit-slider-thumb {\r\n    cursor: default;\r\n}\r\n.leaflet-sbs-range:disabled {\r\n    cursor: default;\r\n}\r\n.leaflet-sbs-range:focus {\r\n    outline: none!important;\r\n}\r\n.leaflet-sbs-range::-moz-focus-outer {\r\n    border: 0;\r\n}\r\n\r\n';
        if (document.getElementsByTagName('style')[0]) {
          document.getElementsByTagName('style')[0].appendChild(document.createTextNode(cssrl));
        } else {
          ((head = document.getElementsByTagName('head')[0]), (style = document.createElement('style')));
          style.type = 'text/css';
          style.appendChild(document.createTextNode(cssrl));
          head.appendChild(style);
        }

        break;
      case 'updown':
        var csstb =
          '.leaflet-sbs-divider {\r\n    position: absolute;\r\n    top: 50%;\r\n    left: 0;\r\n     right: 0;\r\n    margin-top: -2px;\r\n    height:4px;\r\n    width: 100%;\r\n        background-color: #fff;\r\n    pointer-events: none;\r\n    z-index: 999;\r\n}\r\n.leaflet-sbs-range {\r\n    position: absolute;\r\n    top: 45%;\r\n     height: 100%;\r\n    transform: rotate(90deg);\r\n    -webkit-appearance: none;\r\n    display: inline-block!important;\r\n    vertical-align: middle;\r\n    width: 0;\r\n    padding: 0;\r\n    margin: 0;\r\n    border: 0;\r\n    background: rgba(0, 0, 0, 0.25);\r\n      cursor: pointer;\r\n    pointer-events: none;\r\n    z-index: 999;\r\n}\r\n.leaflet-sbs-range::-ms-fill-upper {\r\n    background: transparent;\r\n}\r\n.leaflet-sbs-range::-ms-fill-lower {\r\n    background: rgba(255, 255, 255, 0.25);\r\n}\r\n/* Browser thingies */\r\n\r\n.leaflet-sbs-range::-moz-range-track {\r\n    opacity: 0;\r\n}\r\n.leaflet-sbs-range::-ms-track {\r\n    opacity: 0;\r\n}\r\n.leaflet-sbs-range::-ms-tooltip {\r\n    display: none;\r\n}\r\n/* For whatever reason, these need to be defined\r\n * on their own so dont group them */\r\n\r\n.leaflet-sbs-range::-webkit-slider-thumb {\r\n    -webkit-appearance: none;\r\n    margin: 0;\r\n    padding: 0;\r\n    background: #fff;\r\n    height: 40px;\r\n    width: 40px;\r\n    border-radius: 20px;\r\n    cursor: ns-resize;\r\n    pointer-events: auto;\r\n    border: 1px solid #ddd;\r\n    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAABlBMVEV9fX3///+Kct39AAAAAnRSTlP/AOW3MEoAAAA9SURBVFjD7dehDQAwDANBZ/+l2wmKoiqR7pHRcaeaCxAIBAL/g7k9JxAIBAKBQCAQCAQC14H+MhAIBE4CD3fOFvGVBzhZAAAAAElFTkSuQmCC");\r\n    background-position: 50% 50%;\r\n    background-repeat: no-repeat;\r\n    background-size: 40px 40px;\r\n}\r\n.leaflet-sbs-range::-ms-thumb {\r\n    margin: 0;\r\n    padding: 0;\r\n    background: #fff;\r\n    height: 40px;\r\n    width: 40px;\r\n    border-radius: 20px;\r\n    cursor: ns-resize;\r\n    pointer-events: auto;\r\n    border: 1px solid #ddd;\r\n    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAABlBMVEV9fX3///+Kct39AAAAAnRSTlP/AOW3MEoAAAA9SURBVFjD7dehDQAwDANBZ/+l2wmKoiqR7pHRcaeaCxAIBAL/g7k9JxAIBAKBQCAQCAQC14H+MhAIBE4CD3fOFvGVBzhZAAAAAElFTkSuQmCC");\r\n    background-position: 50% 50%;\r\n    background-repeat: no-repeat;\r\n    background-size: 40px 40px;\r\n}\r\n.leaflet-sbs-range::-moz-range-thumb {\r\n    padding: 0;\r\n    right: 0    ;\r\n    background: #fff;\r\n    height: 40px;\r\n    width: 40px;\r\n    border-radius: 20px;\r\n    cursor: ns-resize;\r\n    pointer-events: auto;\r\n    border: 1px solid #ddd;\r\n    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAABlBMVEV9fX3///+Kct39AAAAAnRSTlP/AOW3MEoAAAA9SURBVFjD7dehDQAwDANBZ/+l2wmKoiqR7pHRcaeaCxAIBAL/g7k9JxAIBAKBQCAQCAQC14H+MhAIBE4CD3fOFvGVBzhZAAAAAElFTkSuQmCC");\r\n    background-position: 50% 50%;\r\n    background-repeat: no-repeat;\r\n    background-size: 40px 40px;\r\n}\r\n.leaflet-sbs-range:disabled::-moz-range-thumb {\r\n    cursor: default;\r\n}\r\n.leaflet-sbs-range:disabled::-ms-thumb {\r\n    cursor: default;\r\n}\r\n.leaflet-sbs-range:disabled::-webkit-slider-thumb {\r\n    cursor: default;\r\n}\r\n.leaflet-sbs-range:disabled {\r\n    cursor: default;\r\n}\r\n.leaflet-sbs-range:focus {\r\n    outline: none!important;\r\n}\r\n.leaflet-sbs-range::-moz-focus-outer {\r\n    border: 0;\r\n}\r\n\r\n';
        if (document.getElementsByTagName('style')[0]) {
          document.getElementsByTagName('style')[0].appendChild(document.createTextNode(csstb));
        } else {
          ((head = document.getElementsByTagName('head')[0]), (style = document.createElement('style')));
          style.type = 'text/css';
          style.appendChild(document.createTextNode(csstb));
          head.appendChild(style);
        }
        break;
    }
  },

  getPosition() {
    const rangeValue = this._range.value;
    const offset = (0.5 - rangeValue) * (2 * this.options.padding + this.options.thumbSize);
    // iclient
    switch (this.options.sbsctrdirection) {
      case 'leftright':
        return this._map.getSize().x * rangeValue + offset;
        break;
      case 'updown':
        return this._map.getSize().y * rangeValue + offset;
        break;
    }
  },
  setPosition() {},

  includes: L.Evented.prototype || L.Mixin.Events,

  addTo(map) {
    this.remove();
    this._map = map;
    const container = (this._container = L.DomUtil.create('div', 'leaflet-sbs', map._controlContainer));
    this._divider = L.DomUtil.create('div', 'leaflet-sbs-divider', container);
    const range = (this._range = L.DomUtil.create('input', 'leaflet-sbs-range', container));

    range.type = 'range';
    range.min = 0;
    range.max = 1;
    range.step = 'any';
    range.value = 0.5;
    range.style.paddingTop = range.style.paddingBottom = `${this.options.padding}px`;
    this._addEvents();
    this._updateLayers();
    return this;
  },

  remove() {
    const sbsnode = document.getElementsByClassName('leaflet-sbs')[0];
    if (sbsnode != undefined) {
      sbsnode.parentNode.removeChild(sbsnode);
    }
    if (this._leftLayers) {
      const leftlayernum = this._leftLayers.length;
      for (var i = 0; i < leftlayernum; i++) {
        (this._leftLayers[i].getContainer
          ? this._leftLayers[i].getContainer()
          : this._leftLayers[i].getPane()
        ).style.clip = '';
      }
    }
    if (this._rightLayers) {
      const rightlayernum = this._rightLayers.length;
      for (var i = 0; i < rightlayernum; i++) {
        (this._rightLayers[i].getContainer
          ? this._rightLayers[i].getContainer()
          : this._rightLayers[i].getPane()
        ).style.clip = '';
      }
    }

    this._removeEvents();
    this._map = null;

    return this;
  },

  setLeftLayers(leftLayers) {
    this._leftLayers = this.asArray(leftLayers);
    this._updateLayers();
    return this;
  },

  setRightLayers(rightLayers) {
    this._rightLayers = this.asArray(rightLayers);
    this._updateLayers();
    return this;
  },

  _updateClip() {
    const map = this._map;
    const nw = map.containerPointToLayerPoint([0, 0]);
    const se = map.containerPointToLayerPoint(map.getSize());
    const clipX = nw.x + this.getPosition();
    const clipY = nw.y + this.getPosition();
    const dividerX = this.getPosition();
    const topvalue = this._map.getSize().y / 2;
    const leftvalue = this._map.getSize().x / 2 - topvalue;
    // iclient
    switch (this.options.sbsctrdirection) {
      case 'leftright': // 左右矩形
        this._divider.style.left = `${dividerX}px`;
        this.fire('dividermove', { x: dividerX });
        var clipLeft = `rect(${[nw.y, clipX, se.y, nw.x].join('px,')}px)`;
        var clipRight = `rect(${[nw.y, se.x, se.y, clipX].join('px,')}px)`;
        break;
      case 'updown': // 上下矩形
        this._divider.style.top = `${dividerX}px`;
        this._range.style.width = `${this._map.getSize().y}px`;
        this._range.style.height = 0;
        this._range.style.top = `${topvalue}px`;
        this._range.style.left = `${leftvalue}px`;
        this.fire('dividermove', { x: dividerX });
        var clipLeft = `rect(${[nw.y, se.x, clipY, nw.x].join('px,')}px)`;
        var clipRight = `rect(${[clipY, se.x, se.y, nw.x].join('px,')}px)`;
        break;
    }

    // iclient 遍历图层
    if (this._leftLayers) {
      const leftlayernum = this._leftLayers.length;
      for (var i = 0; i < leftlayernum; i++) {
        (this._leftLayers[i].getContainer
          ? this._leftLayers[i].getContainer()
          : this._leftLayers[i].getPane()
        ).style.clip = clipLeft;
        // marker图层设置了阴影图片裁剪即leaflet-pane leaflet-shadow-pane类裁剪
        if (this._leftLayers[i]._shadow) {
          this._leftLayers[i]._shadow.parentElement.style.clip = clipLeft;
        }
      }
    }
    if (this._rightLayers) {
      const rightlayernum = this._rightLayers.length;
      for (var i = 0; i < rightlayernum; i++) {
        (this._rightLayers[i].getContainer
          ? this._rightLayers[i].getContainer()
          : this._rightLayers[i].getPane()
        ).style.clip = clipRight;
        // marker图层设置了阴影图片裁剪即leaflet-pane leaflet-shadow-pane类裁剪
        if (this._rightLayers[i]._shadow) {
          this._rightLayers[i]._shadow.parentElement.style.clip = clipRight;
        }
      }
    }
  },

  _updateLayers() {
    if (!this._map) {
      return this;
    }
    const prevLeft = this._leftLayer;
    const prevRight = this._rightLayer;
    this._leftLayer = this._rightLayer = null;
    this._leftLayers.forEach(function (layer) {
      if (this._map.hasLayer(layer)) {
        this._leftLayer = layer;
      }
    }, this);
    this._rightLayers.forEach(function (layer) {
      if (this._map.hasLayer(layer)) {
        this._rightLayer = layer;
      }
    }, this);
    if (prevLeft !== this._leftLayer) {
      prevLeft && this.fire('leftlayerremove', { layer: prevLeft });
      this._leftLayer && this.fire('leftlayeradd', { layer: this._leftLayer });
    }
    if (prevRight !== this._rightLayer) {
      prevRight && this.fire('rightlayerremove', { layer: prevRight });
      this._rightLayer && this.fire('rightlayeradd', { layer: this._rightLayer });
    }
    this._updateClip();
  },

  _addEvents() {
    const range = this._range;
    const map = this._map;
    if (!map || !range) return;
    map.on('move', this._updateClip, this);
    map.on('layeradd layerremove', this._updateLayers, this);
    L.DomEvent.on(range, this.getRangeEvent(range), this._updateClip, this);
    L.DomEvent.on(range, 'touchstart', this.cancelMapDrag, this);
    L.DomEvent.on(range, 'touchend', this.uncancelMapDrag, this);
    L.DomEvent.on(range, 'mousedown', this.cancelMapDrag, this);
    L.DomEvent.on(range, 'mouseup', this.uncancelMapDrag, this);
  },

  _removeEvents() {
    const range = this._range;
    const map = this._map;
    if (range) {
      L.DomEvent.off(range, this.getRangeEvent(range), this._updateClip, this);
      L.DomEvent.off(range, 'touchstart', this.cancelMapDrag, this);
      L.DomEvent.off(range, 'touchend', this.uncancelMapDrag, this);
      L.DomEvent.off(range, 'mousedown', this.cancelMapDrag, this);
      L.DomEvent.off(range, 'mouseup', this.uncancelMapDrag, this);
    }
    if (map) {
      map.off('layeradd layerremove', this._updateLayers, this);
      map.off('move', this._updateClip, this);
    }
  }
});

L.control.sideBySide = function (leftLayers, rightLayers, options) {
  return new L.Control.SideBySide(leftLayers, rightLayers, options);
};
