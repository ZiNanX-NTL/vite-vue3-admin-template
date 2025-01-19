/* global L */

// A layer control which provides for layer groupings.
// Author: Ishmael Smyrnow
L.Control.GroupedLayers = L.Control.extend({
  options: {
    collapsed: true,
    position: 'topright',
    autoZIndex: true,
    exclusiveGroups: [],
    groupCheckboxes: false,
    sortLayers: false,
    sortFunction(layerA, layerB, nameA, nameB) {
      return nameA < nameB ? -1 : nameB < nameA ? 1 : 0;
    }
  },

  initialize(baseLayers, groupedOverlays, options) {
    let i;
    let j;
    L.Util.setOptions(this, options);

    this._layers = [];
    this._lastZIndex = 0;
    this._handlingClick = false;
    this._groupList = [];
    this._domGroups = [];

    for (i in baseLayers) {
      this._addLayer(baseLayers[i], i);
    }

    for (i in groupedOverlays) {
      for (j in groupedOverlays[i]) {
        this._addLayer(groupedOverlays[i][j], j, i, true);
      }
    }
  },

  onAdd(map) {
    this._initLayout();
    this._update();

    map.on('layeradd', this._onLayerChange, this).on('layerremove', this._onLayerChange, this);

    return this._container;
  },

  onRemove(map) {
    map.off('layeradd', this._onLayerChange, this).off('layerremove', this._onLayerChange, this);
  },

  addBaseLayer(layer, name) {
    this._addLayer(layer, name);
    this._update();
    return this;
  },

  addOverlay(layer, name, group) {
    this._addLayer(layer, name, group, true);
    this._update();
    return this;
  },

  removeLayer(layer) {
    const id = L.Util.stamp(layer);
    const _layer = this._getLayer(id);
    if (_layer) {
      this._layers.splice(this._layers.indexOf(_layer), 1);
    }
    this._update();
    return this;
  },

  _getLayer(id) {
    for (let i = 0; i < this._layers.length; i++) {
      if (this._layers[i] && L.stamp(this._layers[i].layer) === id) {
        return this._layers[i];
      }
    }
  },

  _initLayout() {
    const className = 'leaflet-control-layers';
    const container = (this._container = L.DomUtil.create('div', className));

    // Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
    container.setAttribute('aria-haspopup', true);

    if (L.Browser.touch) {
      L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
    } else {
      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.on(container, 'wheel', L.DomEvent.stopPropagation);
    }

    const form = (this._form = L.DomUtil.create('form', `${className}-list`));

    if (this.options.collapsed) {
      if (!L.Browser.android) {
        L.DomEvent.on(container, 'mouseover', this._expand, this).on(container, 'mouseout', this._collapse, this);
      }
      const link = (this._layersLink = L.DomUtil.create('a', `${className}-toggle`, container));
      link.href = '#';
      link.title = 'Layers';

      if (L.Browser.touch) {
        L.DomEvent.on(link, 'click', L.DomEvent.stop).on(link, 'click', this._expand, this);
      } else {
        L.DomEvent.on(link, 'focus', this._expand, this);
      }

      this._map.on('click', this._collapse, this);
      // TODO keyboard accessibility
    } else {
      this._expand();
    }

    this._baseLayersList = L.DomUtil.create('div', `${className}-base`, form);
    this._separator = L.DomUtil.create('div', `${className}-separator`, form);
    this._overlaysList = L.DomUtil.create('div', `${className}-overlays`, form);

    container.appendChild(form);
  },

  _addLayer(layer, name, group, overlay) {
    const id = L.Util.stamp(layer);

    const _layer = {
      layer,
      name,
      overlay
    };
    this._layers.push(_layer);

    group ||= '';
    let groupId = this._indexOf(this._groupList, group);

    if (groupId === -1) {
      groupId = this._groupList.push(group) - 1;
    }

    const exclusive = this._indexOf(this.options.exclusiveGroups, group) !== -1;

    _layer.group = {
      name: group,
      id: groupId,
      exclusive
    };

    if (this.options.sortLayers) {
      this._layers.sort((a, b) => this.options.sortFunction(a.layer, b.layer, a.name, b.name));
    }

    if (this.options.autoZIndex && layer.setZIndex) {
      this._lastZIndex++;
      layer.setZIndex(this._lastZIndex);
    }
  },

  _update() {
    if (!this._container) {
      return;
    }

    this._baseLayersList.innerHTML = '';
    this._overlaysList.innerHTML = '';
    this._domGroups.length = 0;

    let baseLayersPresent = false;
    var i;
    let obj;
    let overlaysPresent = false;

    for (var i = 0; i < this._layers.length; i++) {
      obj = this._layers[i];
      this._addItem(obj);
      overlaysPresent ||= obj.overlay;
      baseLayersPresent ||= !obj.overlay;
    }

    this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';
  },

  _onLayerChange(e) {
    const obj = this._getLayer(L.Util.stamp(e.layer));
    let type;

    if (!obj) {
      return;
    }

    if (!this._handlingClick) {
      this._update();
    }

    if (obj.overlay) {
      type = e.type === 'layeradd' ? 'overlayadd' : 'overlayremove';
    } else {
      type = e.type === 'layeradd' ? 'baselayerchange' : null;
    }

    if (type) {
      this._map.fire(type, obj);
    }
  },

  // IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
  _createRadioElement(name, checked) {
    let radioHtml = `<input type="radio" class="leaflet-control-layers-selector" name="${name}"`;
    if (checked) {
      radioHtml += ' checked="checked"';
    }
    radioHtml += '/>';

    const radioFragment = document.createElement('div');
    radioFragment.innerHTML = radioHtml;

    return radioFragment.firstChild;
  },

  _addItem(obj) {
    const label = document.createElement('label');
    let input;
    const checked = this._map.hasLayer(obj.layer);
    let container;
    let groupRadioName;

    if (obj.overlay) {
      if (obj.group.exclusive) {
        groupRadioName = `leaflet-exclusive-group-layer-${obj.group.id}`;
        input = this._createRadioElement(groupRadioName, checked);
      } else {
        input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'leaflet-control-layers-selector';
        input.defaultChecked = checked;
      }
    } else {
      input = this._createRadioElement('leaflet-base-layers', checked);
    }

    input.layerId = L.Util.stamp(obj.layer);
    input.groupID = obj.group.id;
    L.DomEvent.on(input, 'click', this._onInputClick, this);

    const name = document.createElement('span');
    name.innerHTML = ` ${obj.name}`;

    label.appendChild(input);
    label.appendChild(name);

    if (obj.overlay) {
      container = this._overlaysList;

      let groupContainer = this._domGroups[obj.group.id];

      // Create the group container if it doesn't exist
      if (!groupContainer) {
        groupContainer = document.createElement('div');
        groupContainer.className = 'leaflet-control-layers-group';
        groupContainer.id = `leaflet-control-layers-group-${obj.group.id}`;

        const groupLabel = document.createElement('label');
        groupLabel.className = 'leaflet-control-layers-group-label';

        if (obj.group.name !== '' && !obj.group.exclusive) {
          // ------ add a group checkbox with an _onInputClickGroup function
          if (this.options.groupCheckboxes) {
            const groupInput = document.createElement('input');
            groupInput.type = 'checkbox';
            groupInput.className = 'leaflet-control-layers-group-selector';
            groupInput.groupID = obj.group.id;
            groupInput.legend = this;
            L.DomEvent.on(groupInput, 'click', this._onGroupInputClick, groupInput);
            groupLabel.appendChild(groupInput);
          }
        }

        const groupName = document.createElement('span');
        groupName.className = 'leaflet-control-layers-group-name';
        groupName.innerHTML = obj.group.name;
        groupLabel.appendChild(groupName);

        groupContainer.appendChild(groupLabel);
        container.appendChild(groupContainer);

        this._domGroups[obj.group.id] = groupContainer;
      }

      container = groupContainer;
    } else {
      container = this._baseLayersList;
    }

    container.appendChild(label);

    return label;
  },

  _onGroupInputClick() {
    let i;
    let input;
    let obj;

    const this_legend = this.legend;
    this_legend._handlingClick = true;

    const inputs = this_legend._form.getElementsByTagName('input');
    const inputsLen = inputs.length;

    for (i = 0; i < inputsLen; i++) {
      input = inputs[i];
      if (input.groupID === this.groupID && input.className === 'leaflet-control-layers-selector') {
        input.checked = this.checked;
        obj = this_legend._getLayer(input.layerId);
        if (input.checked && !this_legend._map.hasLayer(obj.layer)) {
          this_legend._map.addLayer(obj.layer);
        } else if (!input.checked && this_legend._map.hasLayer(obj.layer)) {
          this_legend._map.removeLayer(obj.layer);
        }
      }
    }

    this_legend._handlingClick = false;
  },

  _onInputClick() {
    let i;
    let input;
    let obj;
    const inputs = this._form.getElementsByTagName('input');
    const inputsLen = inputs.length;

    this._handlingClick = true;

    for (i = 0; i < inputsLen; i++) {
      input = inputs[i];
      if (input.className === 'leaflet-control-layers-selector') {
        obj = this._getLayer(input.layerId);

        if (input.checked && !this._map.hasLayer(obj.layer)) {
          this._map.addLayer(obj.layer);
        } else if (!input.checked && this._map.hasLayer(obj.layer)) {
          this._map.removeLayer(obj.layer);
        }
      }
    }

    this._handlingClick = false;
  },

  _expand() {
    L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');
    // permits to have a scrollbar if overlays heighter than the map.
    const acceptableHeight = this._map._size.y - this._container.offsetTop * 4;
    if (acceptableHeight < this._form.clientHeight) {
      L.DomUtil.addClass(this._form, 'leaflet-control-layers-scrollbar');
      this._form.style.height = `${acceptableHeight}px`;
    }
  },

  _collapse() {
    this._container.className = this._container.className.replace(' leaflet-control-layers-expanded', '');
  },

  _indexOf(arr, obj) {
    for (let i = 0, j = arr.length; i < j; i++) {
      if (arr[i] === obj) {
        return i;
      }
    }
    return -1;
  }
});

L.control.groupedLayers = function (baseLayers, groupedOverlays, options) {
  return new L.Control.GroupedLayers(baseLayers, groupedOverlays, options);
};
