/* eslint-disable */
import L from 'leaflet';

L.Marker.addInitHook(function () {
  L.setOptions(this, { data: this.options.data });
});

export default L;
