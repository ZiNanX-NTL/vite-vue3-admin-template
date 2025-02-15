/*
 (c) 2014, Vladimir Agafonkin
 simpleheat, a tiny JavaScript library for drawing heatmaps with Canvas
 https://github.com/mourner/simpleheat
*/
!(function () {
  function t(i) {
    return this instanceof t
      ? ((this._canvas = i = typeof i === 'string' ? document.getElementById(i) : i),
        (this._ctx = i.getContext('2d')),
        (this._width = i.width),
        (this._height = i.height),
        (this._max = 1),
        void this.clear())
      : new t(i);
  }
  (t.prototype = {
    defaultRadius: 25,
    defaultGradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1: 'red' },
    data(t, i) {
      return (this._data = t), this;
    },
    max(t) {
      return (this._max = t), this;
    },
    add(t) {
      return this._data.push(t), this;
    },
    clear() {
      return (this._data = []), this;
    },
    radius(t, i) {
      i ||= 15;
      const a = (this._circle = document.createElement('canvas'));
      const s = a.getContext('2d');
      const e = (this._r = t + i);
      return (
        (a.width = a.height = 2 * e),
        (s.shadowOffsetX = s.shadowOffsetY = 200),
        (s.shadowBlur = i),
        (s.shadowColor = 'black'),
        s.beginPath(),
        s.arc(e - 200, e - 200, t, 0, 2 * Math.PI, !0),
        s.closePath(),
        s.fill(),
        this
      );
    },
    gradient(t) {
      const i = document.createElement('canvas');
      const a = i.getContext('2d');
      const s = a.createLinearGradient(0, 0, 0, 256);
      (i.width = 1), (i.height = 256);
      for (const e in t) s.addColorStop(e, t[e]);
      return (a.fillStyle = s), a.fillRect(0, 0, 1, 256), (this._grad = a.getImageData(0, 0, 1, 256).data), this;
    },
    draw(t) {
      this._circle || this.radius(this.defaultRadius), this._grad || this.gradient(this.defaultGradient);
      const i = this._ctx;
      i.clearRect(0, 0, this._width, this._height);
      for (var a, s = 0, e = this._data.length; e > s; s++)
        (a = this._data[s]),
          (i.globalAlpha = Math.max(a[2] / this._max, t || 0.05)),
          i.drawImage(this._circle, a[0] - this._r, a[1] - this._r);
      const n = i.getImageData(0, 0, this._width, this._height);
      return this._colorize(n.data, this._grad), i.putImageData(n, 0, 0), this;
    },
    _colorize(t, i) {
      for (var a, s = 3, e = t.length; e > s; s += 4)
        (a = 4 * t[s]), a && ((t[s - 3] = i[a]), (t[s - 2] = i[a + 1]), (t[s - 1] = i[a + 2]));
    }
  }),
    (window.simpleheat = t);
})(),
  /*
 (c) 2014, Vladimir Agafonkin
 Leaflet.heat, a tiny and fast heatmap plugin for Leaflet.
 https://github.com/Leaflet/Leaflet.heat
*/

  (L.HeatLayer = (L.Layer ? L.Layer : L.Class).extend({
    // options: {
    //     minOpacity: 0.05,
    //     maxZoom: 18,
    //     radius: 25,
    //     blur: 15,
    //     max: 1.0
    // },

    initialize(latlngs, options) {
      this._latlngs = latlngs;
      L.setOptions(this, options);
    },

    setLatLngs(latlngs) {
      this._latlngs = latlngs;
      return this.redraw();
    },

    addLatLng(latlng) {
      this._latlngs.push(latlng);
      return this.redraw();
    },

    setOptions(options) {
      L.setOptions(this, options);
      if (this._heat) {
        this._updateOptions();
      }
      return this.redraw();
    },

    getBounds() {
      return L.latLngBounds(this._latlngs);
    },

    redraw() {
      if (this._heat && !this._frame && this._map && !this._map._animating) {
        this._frame = L.Util.requestAnimFrame(this._redraw, this);
      }
      return this;
    },

    onAdd(map) {
      this._map = map;

      if (!this._canvas) {
        this._initCanvas();
      }

      if (this.options.pane) {
        this.getPane().appendChild(this._canvas);
      } else {
        map._panes.overlayPane.appendChild(this._canvas);
      }

      map.on('moveend', this._reset, this);

      if (map.options.zoomAnimation && L.Browser.any3d) {
        map.on('zoomanim', this._animateZoom, this);
      }

      this._reset();
    },

    onRemove(map) {
      if (this.options.pane) {
        this.getPane().removeChild(this._canvas);
      } else {
        map.getPanes().overlayPane.removeChild(this._canvas);
      }

      map.off('moveend', this._reset, this);

      if (map.options.zoomAnimation) {
        map.off('zoomanim', this._animateZoom, this);
      }
    },

    addTo(map) {
      map.addLayer(this);
      return this;
    },

    _initCanvas() {
      const canvas = (this._canvas = L.DomUtil.create('canvas', 'leaflet-heatmap-layer leaflet-layer'));

      const originProp = L.DomUtil.testProp(['transformOrigin', 'WebkitTransformOrigin', 'msTransformOrigin']);
      canvas.style[originProp] = '50% 50%';

      const size = this._map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;

      const animated = this._map.options.zoomAnimation && L.Browser.any3d;
      L.DomUtil.addClass(canvas, `leaflet-zoom-${animated ? 'animated' : 'hide'}`);

      this._heat = simpleheat(canvas);
      this._updateOptions();
    },

    _updateOptions() {
      this._heat.radius(this.options.radius || this._heat.defaultRadius, this.options.blur);

      if (this.options.gradient) {
        this._heat.gradient(this.options.gradient);
      }
      if (this.options.max) {
        this._heat.max(this.options.max);
      }
    },

    _reset() {
      const topLeft = this._map.containerPointToLayerPoint([0, 0]);
      L.DomUtil.setPosition(this._canvas, topLeft);

      const size = this._map.getSize();

      if (this._heat._width !== size.x) {
        this._canvas.width = this._heat._width = size.x;
      }
      if (this._heat._height !== size.y) {
        this._canvas.height = this._heat._height = size.y;
      }

      this._redraw();
    },

    _redraw() {
      if (!this._map) {
        return;
      }
      const data = [];
      const r = this._heat._r;
      const size = this._map.getSize();
      const bounds = new L.Bounds(L.point([-r, -r]), size.add([r, r]));

      const max = this.options.max === undefined ? 1 : this.options.max;
      const maxZoom = this.options.maxZoom === undefined ? this._map.getMaxZoom() : this.options.maxZoom;
      const v = 1 / 2 ** Math.max(0, Math.min(maxZoom - this._map.getZoom(), 12));
      const cellSize = r / 2;
      const grid = [];
      const panePos = this._map._getMapPanePos();
      const offsetX = panePos.x % cellSize;
      const offsetY = panePos.y % cellSize;
      let i;
      let len;
      let p;
      let cell;
      let x;
      let y;
      let j;
      let len2;
      let k;

      // console.time('process');
      for (i = 0, len = this._latlngs.length; i < len; i++) {
        p = this._map.latLngToContainerPoint(this._latlngs[i]);
        if (bounds.contains(p)) {
          x = Math.floor((p.x - offsetX) / cellSize) + 2;
          y = Math.floor((p.y - offsetY) / cellSize) + 2;

          const alt =
            this._latlngs[i].alt !== undefined
              ? this._latlngs[i].alt
              : this._latlngs[i][2] !== undefined
                ? +this._latlngs[i][2]
                : 1;
          k = alt * v;

          grid[y] = grid[y] || [];
          cell = grid[y][x];

          if (!cell) {
            grid[y][x] = [p.x, p.y, k];
          } else {
            cell[0] = (cell[0] * cell[2] + p.x * k) / (cell[2] + k); // x
            cell[1] = (cell[1] * cell[2] + p.y * k) / (cell[2] + k); // y
            cell[2] += k; // cumulated intensity value
          }
        }
      }

      for (i = 0, len = grid.length; i < len; i++) {
        if (grid[i]) {
          for (j = 0, len2 = grid[i].length; j < len2; j++) {
            cell = grid[i][j];
            if (cell) {
              data.push([Math.round(cell[0]), Math.round(cell[1]), Math.min(cell[2], max)]);
            }
          }
        }
      }
      // console.timeEnd('process');

      // console.time('draw ' + data.length);
      this._heat.data(data).draw(this.options.minOpacity);
      // console.timeEnd('draw ' + data.length);

      this._frame = null;
    },

    _animateZoom(e) {
      const scale = this._map.getZoomScale(e.zoom);
      const offset = this._map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(this._map._getMapPanePos());

      if (L.DomUtil.setTransform) {
        L.DomUtil.setTransform(this._canvas, offset, scale);
      } else {
        this._canvas.style[L.DomUtil.TRANSFORM] = `${L.DomUtil.getTranslateString(offset)} scale(${scale})`;
      }
    }
  }));

L.heatLayer = function (latlngs, options) {
  return new L.HeatLayer(latlngs, options);
};
