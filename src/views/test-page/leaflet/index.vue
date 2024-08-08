<template>
  <div class="leaflet-map w-full overflow-hidden !p-0">
    <div ref="domRef" class="size-full overflow-hidden"></div>
  </div>
</template>

<script setup lang="jsx">
import { darkTheme } from 'naive-ui';
import { Button as DvButton } from '@kjgl77/datav-vue3';
import L from 'leaflet';
import { TIANDITU_KEY } from '@/config';
import { useLeaflet } from '@/hooks';
import { instantiatedComponent } from '@/utils';
import pointList from '@/assets/json/pointList.json';
import soyPoint from '@/assets/images/soy_point.png';

// 定义提示内容组件
const TooltipContent = defineComponent(
  props => {
    const item = props.item;

    return () => {
      // 渲染函数或 JSX
      return (
        <n-config-provider theme={darkTheme}>
          <div class="flex-col items-center">
            <DvButton
              class="map-btn pointer-events-auto relative mb-10px mt-15px before:absolute before:block before:size-full before:bg-#000000ab before:content-empty before:-z-1"
              style=""
              color="#0ea8f8"
              font-color="#fff"
              onClick={() => {
                console.log(item);
              }}
            >
              {item.technicalName}
            </DvButton>
          </div>
        </n-config-provider>
      );
    };
  },
  {
    name: 'TooltipContent',
    props: {
      item: {
        type: Object,
        default: () => ({})
      }
    }
  }
);

const { domRef } = useLeaflet(
  {
    attributionControl: true
    // crs: undefined
  },
  {
    onRender(map) {
      // 添加版权
      const attribution = map.attributionControl;
      attribution.setPrefix('');
      attribution.addAttribution('<span style="font-size: 16px;">GS(2023)336号 - 甲测资字1100471</span>');
      // 添加地图
      // L.tileLayer(
      //   `http://t{s}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TIANDITU_KEY}`,
      //   {
      //     subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']
      //     // zoomOffset: 1
      //   }
      // ).addTo(map);
      L.tileLayer(`https://t{s}.tianditu.gov.cn/DataServer?T=img_c&X={x}&Y={y}&L={z}&tk=${TIANDITU_KEY}`, {
        subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
        zoomOffset: 1
      }).addTo(map);
      // L.tileLayer(`https://t{s}.tianditu.gov.cn/DataServer?T=img_c&X={x}&Y={y}&L={z}&tk=${TIANDITU_KEY}`, {
      //   subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
      //   zoomOffset: 1
      // }).addTo(map);
      L.tileLayer(
        `https://t{s}.tianditu.gov.cn/cia_c/wmts?layer=cia&style=default&tilematrixset=c&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}&tk=${TIANDITU_KEY}`,
        {
          subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
          zoomOffset: 1
        }
      ).addTo(map);

      L.esri
        .dynamicMapLayer({
          url: 'https://120.26.76.205:6443/arcgis/rest/services/hljwlw/hljqx/MapServer'
        })
        .addTo(map);
      L.esri
        .dynamicMapLayer({
          url: 'http://59.110.28.240:6080/arcgis/rest/services/newwlw/hljGreenSoybean/MapServer'
        })
        .addTo(map);
      const mapServer = L.esri
        .dynamicMapLayer({
          url: 'http://59.110.28.240:6080/arcgis/rest/services/newwlw/hljzldd/MapServer',
          pane: 'shadowPane'
        })
        .addTo(map);

      // 打点
      const markList = pointList.map(item => {
        return L.marker([item.y, item.x], {
          icon: L.icon({
            iconUrl: soyPoint,
            iconSize: [35, 36.5]
          })
        })
          .bindTooltip(instantiatedComponent(TooltipContent, { item }).el, {
            permanent: true,
            direction: 'top',
            offset: [0, 0],
            className: 'map-tooltip'
          })
          .openTooltip()
          .on('click', _e => {
            // popup
            //   .setLatLng([item.y, item.x])
            //   .setContent(instantiatedComponent(PopupContent, { item, popup }).el)
            //   .openOn(map);
          });
      });
      const markLayer = L.layerGroup(markList).addTo(map);

      // 添加地图控制图层控件
      const overlayMaps = {
        [`<div class='legend block-legend'/></div> <span class='my-layer-item'>绿色种植区县</span>`]: mapServer,
        [`<img class='legend' src='${soyPoint}' /> <span class='my-layer-item'>防治技术实施</span>`]: markLayer
      };
      L.control.layers(undefined, overlayMaps, { position: 'bottomleft', collapsed: false }).addTo(map);
    }
  }
);
</script>

<style lang="scss" scoped>
.leaflet-map {
  /* 去掉地图聚焦边框 */
  :deep(.esri-view-surface:focus::after) {
    outline: none !important;
  }
  :deep(.leaflet-control-layers) {
    border: 1px solid #18bdf2;
    @apply bg-#101b2882 p-15px;
    .leaflet-control-layers-overlays {
      > label {
        > span {
          @apply flex items-center;
          > input[type='checkbox'] {
            @apply w-15px h-15px bg-transparent appearance-none outline-none;
            border: 1px solid #18bdf2;
            &:checked {
              // border: none;
              background: url('/src/assets/images/checked.png') no-repeat center;
              background-size: contain;
            }
          }
          > .leaflet-control-layers-selector {
            @apply mt-0 top-0 mr-5px;
          }
          > span {
            @apply flex items-center text-#fff;
            .legend {
              @apply w-29px h-32px mr-5px;
            }
            .block-legend {
              @apply flex-center before:content-empty before:block before:w-20px before:h-20px before:bg-#74f84d;
            }
          }
        }
      }
    }
  }
  // :deep(.leaflet-touch .leaflet-control-layers) {
  // @apply mt-50px;
  // }
  :deep(.map-popup) {
    .leaflet-popup-content-wrapper {
      @apply bg-transparent text-unset shadow-none;
      .leaflet-popup-content {
        @apply m-0;
      }
      .dv-border-svg-container {
        @apply z-0;
      }
    }
    .leaflet-popup-tip {
      @apply hidden;
    }

    .popup-wrap {
      background: url('/src/assets/images/soy-popup.png') no-repeat center/100% 100%;
    }
    .n-descriptions-table-wrapper {
      @apply bg-transparent border-none;
      .n-descriptions-table-row .n-descriptions-table-header:not(:last-child) {
        border-right: none;
      }
      .n-descriptions-table-row:not(:last-child) .n-descriptions-table-header {
        @apply border-#616161;
      }
      .n-descriptions-table-row:not(:last-child) .n-descriptions-table-content {
        @apply border-#616161;
      }
    }
  }
  :deep(.map-tooltip) {
    &.leaflet-tooltip {
      @apply bg-transparent text-unset shadow-none border-none;
    }
    &::before {
      display: none;
    }
    .map-btn {
      &::before {
        clip-path: polygon(0% 0%, 100% 0%, 100% 50%, 90% 100%, 0% 100%);
      }
    }
  }
}
</style>
