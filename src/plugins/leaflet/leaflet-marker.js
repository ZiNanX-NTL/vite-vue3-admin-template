/* eslint-disable */
L.Marker.addInitHook(function () {
  L.setOptions(this, { data: this.options.data });
});
