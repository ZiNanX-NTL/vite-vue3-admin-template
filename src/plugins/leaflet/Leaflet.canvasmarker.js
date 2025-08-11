(function webpackUniversalModuleDefinition(root, factory) {
  if (typeof exports === 'object' && typeof module === 'object') module.exports = factory();
  else if (typeof define === 'function' && define.amd) define([], factory);
  else {
    const a = factory();
    for (const i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
  }
})(self, function () {
  return /***/ (() => {
    // webpackBootstrap
    /***/ const __webpack_modules__ = [
      ,
      /* 0 */ /* 1 */
      /***/ (module, __unused_webpack_exports, __webpack_require__) => {
        module.exports = rbush;
        module.exports.default = rbush;

        const quickselect = __webpack_require__(2);

        function rbush(maxEntries, format) {
          if (!(this instanceof rbush)) return new rbush(maxEntries, format);

          // max entries in a node is 9 by default; min node fill is 40% for best performance
          this._maxEntries = Math.max(4, maxEntries || 9);
          this._minEntries = Math.max(2, Math.ceil(this._maxEntries * 0.4));

          if (format) {
            this._initFormat(format);
          }

          this.clear();
        }

        rbush.prototype = {
          all() {
            return this._all(this.data, []);
          },

          search(bbox) {
            let node = this.data;
            const result = [];
            const toBBox = this.toBBox;

            if (!intersects(bbox, node)) return result;

            const nodesToSearch = [];
            let i;
            let len;
            let child;
            let childBBox;

            while (node) {
              for (i = 0, len = node.children.length; i < len; i++) {
                child = node.children[i];
                childBBox = node.leaf ? toBBox(child) : child;

                if (intersects(bbox, childBBox)) {
                  if (node.leaf) result.push(child);
                  else if (contains(bbox, childBBox)) this._all(child, result);
                  else nodesToSearch.push(child);
                }
              }
              node = nodesToSearch.pop();
            }

            return result;
          },

          collides(bbox) {
            let node = this.data;
            const toBBox = this.toBBox;

            if (!intersects(bbox, node)) return false;

            const nodesToSearch = [];
            let i;
            let len;
            let child;
            let childBBox;

            while (node) {
              for (i = 0, len = node.children.length; i < len; i++) {
                child = node.children[i];
                childBBox = node.leaf ? toBBox(child) : child;

                if (intersects(bbox, childBBox)) {
                  if (node.leaf || contains(bbox, childBBox)) return true;
                  nodesToSearch.push(child);
                }
              }
              node = nodesToSearch.pop();
            }

            return false;
          },

          load(data) {
            if (!(data && data.length)) return this;

            if (data.length < this._minEntries) {
              for (let i = 0, len = data.length; i < len; i++) {
                this.insert(data[i]);
              }
              return this;
            }

            // recursively build the tree with the given data from scratch using OMT algorithm
            let node = this._build(data.slice(), 0, data.length - 1, 0);

            if (!this.data.children.length) {
              // save as is if tree is empty
              this.data = node;
            } else if (this.data.height === node.height) {
              // split root if trees have the same height
              this._splitRoot(this.data, node);
            } else {
              if (this.data.height < node.height) {
                // swap trees if inserted one is bigger
                const tmpNode = this.data;
                this.data = node;
                node = tmpNode;
              }

              // insert the small tree into the large tree at appropriate level
              this._insert(node, this.data.height - node.height - 1, true);
            }

            return this;
          },

          insert(item) {
            if (item) this._insert(item, this.data.height - 1);
            return this;
          },

          clear() {
            this.data = createNode([]);
            return this;
          },

          remove(item, equalsFn) {
            if (!item) return this;

            let node = this.data;
            const bbox = this.toBBox(item);
            const path = [];
            const indexes = [];
            let i;
            let parent;
            let index;
            let goingUp;

            // depth-first iterative tree traversal
            while (node || path.length) {
              if (!node) {
                // go up
                node = path.pop();
                parent = path[path.length - 1];
                i = indexes.pop();
                goingUp = true;
              }

              if (node.leaf) {
                // check current node
                index = findItem(item, node.children, equalsFn);

                if (index !== -1) {
                  // item found, remove the item and condense tree upwards
                  node.children.splice(index, 1);
                  path.push(node);
                  this._condense(path);
                  return this;
                }
              }

              if (!goingUp && !node.leaf && contains(node, bbox)) {
                // go down
                path.push(node);
                indexes.push(i);
                i = 0;
                parent = node;
                node = node.children[0];
              } else if (parent) {
                // go right
                i++;
                node = parent.children[i];
                goingUp = false;
              } else node = null; // nothing found
            }

            return this;
          },

          toBBox(item) {
            return item;
          },

          compareMinX: compareNodeMinX,
          compareMinY: compareNodeMinY,

          toJSON() {
            return this.data;
          },

          fromJSON(data) {
            this.data = data;
            return this;
          },

          _all(node, result) {
            const nodesToSearch = [];
            while (node) {
              if (node.leaf) result.push.apply(result, node.children);
              else nodesToSearch.push.apply(nodesToSearch, node.children);

              node = nodesToSearch.pop();
            }
            return result;
          },

          _build(items, left, right, height) {
            const N = right - left + 1;
            let M = this._maxEntries;
            let node;

            if (N <= M) {
              // reached leaf level; return leaf
              node = createNode(items.slice(left, right + 1));
              calcBBox(node, this.toBBox);
              return node;
            }

            if (!height) {
              // target height of the bulk-loaded tree
              height = Math.ceil(Math.log(N) / Math.log(M));

              // target number of root entries to maximize storage utilization
              M = Math.ceil(N / M ** (height - 1));
            }

            node = createNode([]);
            node.leaf = false;
            node.height = height;

            // split the items into M mostly square tiles

            const N2 = Math.ceil(N / M);
            const N1 = N2 * Math.ceil(Math.sqrt(M));
            let i;
            let j;
            let right2;
            let right3;

            multiSelect(items, left, right, N1, this.compareMinX);

            for (i = left; i <= right; i += N1) {
              right2 = Math.min(i + N1 - 1, right);

              multiSelect(items, i, right2, N2, this.compareMinY);

              for (j = i; j <= right2; j += N2) {
                right3 = Math.min(j + N2 - 1, right2);

                // pack each entry recursively
                node.children.push(this._build(items, j, right3, height - 1));
              }
            }

            calcBBox(node, this.toBBox);

            return node;
          },

          _chooseSubtree(bbox, node, level, path) {
            let area;
            let child;
            let enlargement;
            let i;
            let len;
            let minArea;
            let minEnlargement;
            let targetNode;

            while (true) {
              path.push(node);

              if (node.leaf || path.length - 1 === level) break;

              minArea = minEnlargement = Infinity;

              for (i = 0, len = node.children.length; i < len; i++) {
                child = node.children[i];
                area = bboxArea(child);
                enlargement = enlargedArea(bbox, child) - area;

                // choose entry with the least area enlargement
                if (enlargement < minEnlargement) {
                  minEnlargement = enlargement;
                  minArea = area < minArea ? area : minArea;
                  targetNode = child;
                } else if (enlargement === minEnlargement) {
                  // otherwise choose one with the smallest area
                  if (area < minArea) {
                    minArea = area;
                    targetNode = child;
                  }
                }
              }

              node = targetNode || node.children[0];
            }

            return node;
          },

          _insert(item, level, isNode) {
            const toBBox = this.toBBox;
            const bbox = isNode ? item : toBBox(item);
            const insertPath = [];

            // find the best node for accommodating the item, saving all nodes along the path too
            const node = this._chooseSubtree(bbox, this.data, level, insertPath);

            // put the item into the node
            node.children.push(item);
            extend(node, bbox);

            // split on node overflow; propagate upwards if necessary
            while (level >= 0) {
              if (insertPath[level].children.length > this._maxEntries) {
                this._split(insertPath, level);
                level--;
              } else break;
            }

            // adjust bboxes along the insertion path
            this._adjustParentBBoxes(bbox, insertPath, level);
          },

          // split overflowed node into two
          _split(insertPath, level) {
            const node = insertPath[level];
            const M = node.children.length;
            const m = this._minEntries;

            this._chooseSplitAxis(node, m, M);

            const splitIndex = this._chooseSplitIndex(node, m, M);

            const newNode = createNode(node.children.splice(splitIndex, node.children.length - splitIndex));
            newNode.height = node.height;
            newNode.leaf = node.leaf;

            calcBBox(node, this.toBBox);
            calcBBox(newNode, this.toBBox);

            if (level) insertPath[level - 1].children.push(newNode);
            else this._splitRoot(node, newNode);
          },

          _splitRoot(node, newNode) {
            // split root node
            this.data = createNode([node, newNode]);
            this.data.height = node.height + 1;
            this.data.leaf = false;
            calcBBox(this.data, this.toBBox);
          },

          _chooseSplitIndex(node, m, M) {
            let area;
            let bbox1;
            let bbox2;
            let i;
            let index;
            let minArea;
            let minOverlap;
            let overlap;

            minOverlap = minArea = Infinity;

            for (i = m; i <= M - m; i++) {
              bbox1 = distBBox(node, 0, i, this.toBBox);
              bbox2 = distBBox(node, i, M, this.toBBox);

              overlap = intersectionArea(bbox1, bbox2);
              area = bboxArea(bbox1) + bboxArea(bbox2);

              // choose distribution with minimum overlap
              if (overlap < minOverlap) {
                minOverlap = overlap;
                index = i;

                minArea = area < minArea ? area : minArea;
              } else if (overlap === minOverlap) {
                // otherwise choose distribution with minimum area
                if (area < minArea) {
                  minArea = area;
                  index = i;
                }
              }
            }

            return index;
          },

          // sorts node children by the best axis for split
          _chooseSplitAxis(node, m, M) {
            const compareMinX = node.leaf ? this.compareMinX : compareNodeMinX;
            const compareMinY = node.leaf ? this.compareMinY : compareNodeMinY;
            const xMargin = this._allDistMargin(node, m, M, compareMinX);
            const yMargin = this._allDistMargin(node, m, M, compareMinY);

            // if total distributions margin value is minimal for x, sort by minX,
            // otherwise it's already sorted by minY
            if (xMargin < yMargin) node.children.sort(compareMinX);
          },

          // total margin of all possible split distributions where each node is at least m full
          _allDistMargin(node, m, M, compare) {
            node.children.sort(compare);

            const toBBox = this.toBBox;
            const leftBBox = distBBox(node, 0, m, toBBox);
            const rightBBox = distBBox(node, M - m, M, toBBox);
            let margin = bboxMargin(leftBBox) + bboxMargin(rightBBox);
            let i;
            let child;

            for (i = m; i < M - m; i++) {
              child = node.children[i];
              extend(leftBBox, node.leaf ? toBBox(child) : child);
              margin += bboxMargin(leftBBox);
            }

            for (i = M - m - 1; i >= m; i--) {
              child = node.children[i];
              extend(rightBBox, node.leaf ? toBBox(child) : child);
              margin += bboxMargin(rightBBox);
            }

            return margin;
          },

          _adjustParentBBoxes(bbox, path, level) {
            // adjust bboxes along the given tree path
            for (let i = level; i >= 0; i--) {
              extend(path[i], bbox);
            }
          },

          _condense(path) {
            // go through the path, removing empty nodes and updating bboxes
            for (var i = path.length - 1, siblings; i >= 0; i--) {
              if (path[i].children.length === 0) {
                if (i > 0) {
                  siblings = path[i - 1].children;
                  siblings.splice(siblings.indexOf(path[i]), 1);
                } else this.clear();
              } else calcBBox(path[i], this.toBBox);
            }
          },

          _initFormat(format) {
            // data format (minX, minY, maxX, maxY accessors)

            // uses eval-type function compilation instead of just accepting a toBBox function
            // because the algorithms are very sensitive to sorting functions performance,
            // so they should be dead simple and without inner calls

            const compareArr = ['return a', ' - b', ';'];

            this.compareMinX = new Function('a', 'b', compareArr.join(format[0]));
            this.compareMinY = new Function('a', 'b', compareArr.join(format[1]));

            this.toBBox = new Function(
              'a',
              `return {minX: a${format[0]}, minY: a${format[1]}, maxX: a${format[2]}, maxY: a${format[3]}};`
            );
          }
        };

        function findItem(item, items, equalsFn) {
          if (!equalsFn) return items.indexOf(item);

          for (let i = 0; i < items.length; i++) {
            if (equalsFn(item, items[i])) return i;
          }
          return -1;
        }

        // calculate node's bbox from bboxes of its children
        function calcBBox(node, toBBox) {
          distBBox(node, 0, node.children.length, toBBox, node);
        }

        // min bounding rectangle of node children from k to p-1
        function distBBox(node, k, p, toBBox, destNode) {
          if (!destNode) destNode = createNode(null);
          destNode.minX = Infinity;
          destNode.minY = Infinity;
          destNode.maxX = -Infinity;
          destNode.maxY = -Infinity;

          for (var i = k, child; i < p; i++) {
            child = node.children[i];
            extend(destNode, node.leaf ? toBBox(child) : child);
          }

          return destNode;
        }

        function extend(a, b) {
          a.minX = Math.min(a.minX, b.minX);
          a.minY = Math.min(a.minY, b.minY);
          a.maxX = Math.max(a.maxX, b.maxX);
          a.maxY = Math.max(a.maxY, b.maxY);
          return a;
        }

        function compareNodeMinX(a, b) {
          return a.minX - b.minX;
        }
        function compareNodeMinY(a, b) {
          return a.minY - b.minY;
        }

        function bboxArea(a) {
          return (a.maxX - a.minX) * (a.maxY - a.minY);
        }
        function bboxMargin(a) {
          return a.maxX - a.minX + (a.maxY - a.minY);
        }

        function enlargedArea(a, b) {
          return (
            (Math.max(b.maxX, a.maxX) - Math.min(b.minX, a.minX)) *
            (Math.max(b.maxY, a.maxY) - Math.min(b.minY, a.minY))
          );
        }

        function intersectionArea(a, b) {
          const minX = Math.max(a.minX, b.minX);
          const minY = Math.max(a.minY, b.minY);
          const maxX = Math.min(a.maxX, b.maxX);
          const maxY = Math.min(a.maxY, b.maxY);

          return Math.max(0, maxX - minX) * Math.max(0, maxY - minY);
        }

        function contains(a, b) {
          return a.minX <= b.minX && a.minY <= b.minY && b.maxX <= a.maxX && b.maxY <= a.maxY;
        }

        function intersects(a, b) {
          return b.minX <= a.maxX && b.minY <= a.maxY && b.maxX >= a.minX && b.maxY >= a.minY;
        }

        function createNode(children) {
          return {
            children,
            height: 1,
            leaf: true,
            minX: Infinity,
            minY: Infinity,
            maxX: -Infinity,
            maxY: -Infinity
          };
        }

        // sort an array so that items come in groups of n unsorted items, with groups sorted between each other;
        // combines selection algorithm with binary divide & conquer approach

        function multiSelect(arr, left, right, n, compare) {
          const stack = [left, right];
          let mid;

          while (stack.length) {
            right = stack.pop();
            left = stack.pop();

            if (right - left <= n) continue;

            mid = left + Math.ceil((right - left) / n / 2) * n;
            quickselect(arr, mid, left, right, compare);

            stack.push(left, mid, mid, right);
          }
        }

        /***/
      },
      /* 2 */
      /***/ function (module) {
        (function (global, factory) {
          true ? (module.exports = factory()) : 0;
        })(this, function () {
          function quickselect(arr, k, left, right, compare) {
            quickselectStep(arr, k, left || 0, right || arr.length - 1, compare || defaultCompare);
          }

          function quickselectStep(arr, k, left, right, compare) {
            while (right > left) {
              if (right - left > 600) {
                const n = right - left + 1;
                const m = k - left + 1;
                const z = Math.log(n);
                const s = 0.5 * Math.exp((2 * z) / 3);
                const sd = 0.5 * Math.sqrt((z * s * (n - s)) / n) * (m - n / 2 < 0 ? -1 : 1);
                const newLeft = Math.max(left, Math.floor(k - (m * s) / n + sd));
                const newRight = Math.min(right, Math.floor(k + ((n - m) * s) / n + sd));
                quickselectStep(arr, k, newLeft, newRight, compare);
              }

              const t = arr[k];
              let i = left;
              let j = right;

              swap(arr, left, k);
              if (compare(arr[right], t) > 0) swap(arr, left, right);

              while (i < j) {
                swap(arr, i, j);
                i++;
                j--;
                while (compare(arr[i], t) < 0) i++;
                while (compare(arr[j], t) > 0) j--;
              }

              if (compare(arr[left], t) === 0) swap(arr, left, j);
              else {
                j++;
                swap(arr, j, right);
              }

              if (j <= k) left = j + 1;
              if (k <= j) right = j - 1;
            }
          }

          function swap(arr, i, j) {
            const tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
          }

          function defaultCompare(a, b) {
            return a < b ? -1 : a > b ? 1 : 0;
          }

          return quickselect;
        });

        /***/
      }
      /***/
    ];
    /***/
    /***/ // The module cache
    /***/ const __webpack_module_cache__ = {};
    /***/
    /***/ // The require function
    /***/ function __webpack_require__(moduleId) {
      /***/ // Check if module is in cache
      /***/ const cachedModule = __webpack_module_cache__[moduleId];
      /***/ if (cachedModule !== undefined) {
        /***/ return cachedModule.exports;
        /***/
      }
      /***/ // Create a new module (and put it into the cache)
      /***/ const module = (__webpack_module_cache__[moduleId] = {
        /***/ // no module.id needed
        /***/ // no module.loaded needed
        /***/ exports: {}
        /***/
      });
      /***/
      /***/ // Execute the module function
      /***/ __webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
      /***/
      /***/ // Return the exports of the module
      /***/ return module.exports;
      /***/
    }
    /***/
    /***/
    /***/ /* webpack/runtime/compat get default export */
    /***/ (() => {
      /***/ // getDefaultExport function for compatibility with non-harmony modules
      /***/ __webpack_require__.n = module => {
        /***/ const getter = module && module.__esModule ? /***/ () => module.default : /***/ () => module;
        /***/ __webpack_require__.d(getter, { a: getter });
        /***/ return getter;
        /***/
      };
      /***/
    })();
    /***/
    /***/ /* webpack/runtime/define property getters */
    /***/ (() => {
      /***/ // define getter functions for harmony exports
      /***/ __webpack_require__.d = (exports, definition) => {
        /***/ for (const key in definition) {
          /***/ if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
            /***/ Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
            /***/
          }
          /***/
        }
        /***/
      };
      /***/
    })();
    /***/
    /***/ /* webpack/runtime/hasOwnProperty shorthand */
    /***/ (() => {
      /***/ __webpack_require__.o = (obj, prop) => Object.hasOwn(obj, prop);
      /***/
    })();
    /***/
    /***/ /* webpack/runtime/make namespace object */
    /***/ (() => {
      /***/ // define __esModule on exports
      /***/ __webpack_require__.r = exports => {
        /***/ if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
          /***/ Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
          /***/
        }
        /***/ Object.defineProperty(exports, '__esModule', { value: true });
        /***/
      };
      /***/
    })();
    /***/
    /***/
    const __webpack_exports__ = {};
    // This entry need to be wrapped in an IIFE because it need to be in strict mode.
    (() => {
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ CanvasMarkerLayer: () => /* binding */ CanvasMarkerLayer,
        /* harmony export */ canvasMarkerLayer: () => /* binding */ canvasMarkerLayer
        /* harmony export */
      });
      /* harmony import */ const rbush__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
      /* harmony import */ const rbush__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */ __webpack_require__.n(
        rbush__WEBPACK_IMPORTED_MODULE_0__
      );
      // https://www.5axxw.com/wiki/content/7wjc4t
      /**
       * @example
       *   let latlng = marker.getLatlng();
       *   let markerData = {
       *     minX: latlng.lng,
       *     minY: latlng.lat,
       *     maxX: latlng.lng,
       *     maxY: latlng.lat,
       *     data: marker
       *   };
       *
       * @typedef {Object} MarkerData marker的rubsh数据
       * @property {Number} MarkerData.minX marker的经度
       * @property {Number} MarkerData.minY marker的纬度
       * @property {Number} MarkerData.maxX marker的经度
       * @property {Number} MarkerData.maxY marker的纬度
       * @property {L.Marker} MarkerData.data marker对象
       */

      /**
       * @example
       *   let options = marker.options.icon.options;
       *   let minX, minY, maxX, maxY;
       *   minX = pointPos.x - options.iconAnchor[0];
       *   maxX = minX + options.iconSize[0];
       *   minY = pointPos.y - options.iconAnchor[1];
       *   maxY = minY + options.iconSize[1];
       *
       *   let markerBounds = {
       *     minX,
       *     minY,
       *     maxX,
       *     maxY
       *   };
       *
       * @typedef {Object} MarkerBoundsData marker的像素边界rubsh数据
       * @property {Number} MarkerBoundsData.minX marker的左上角x轴像素坐标
       * @property {Number} MarkerBoundsData.minY marker的左上角y轴像素坐标
       * @property {Number} MarkerBoundsData.maxX marker的右下角x轴像素坐标
       * @property {Number} MarkerBoundsData.maxY marker的右下角y轴像素坐标
       * @property {L.Marker} MarkerBoundsData.data marker对象
       */

      let isClick = null;
      let isMousemove = false;
      let isMousedown = false;
      let isMouseup = false;

      /** 用于在画布而不是DOM上显示标记的leaflet插件。使用单页1.0.0及更高版本。 */
      var CanvasMarkerLayer = (L.CanvasMarkerLayer = L.Layer.extend({
        options: {
          zIndex: null, // 图层dom元素的堆叠顺序
          collisionFlg: false, // 碰撞检测
          moveReset: false, // 在move时是否刷新地图
          opacity: 1 // 图层透明度
        },
        // Add event listeners to initialized section.
        initialize(options) {
          L.setOptions(this, options);
          this._onClickListeners = [];
          this._onHoverListeners = [];
          this._onMouseDownListeners = [];
          this._onMouseUpListeners = [];

          /**
           * 所有marker的集合
           *
           * @type {rbush<MarkerData>}
           */
          this._markers = new (rbush__WEBPACK_IMPORTED_MODULE_0___default())();
          this._markers.dirty = 0; // 单个插入/删除
          this._markers.total = 0; // 总数

          /**
           * 在地图当前范围内的marker的集合
           *
           * @type {rbush<MarkerData>}
           */
          this._containMarkers = new (rbush__WEBPACK_IMPORTED_MODULE_0___default())();

          /**
           * 当前显示在地图上的marker的集合
           *
           * @type {rbush<MarkerData>}
           */
          this._showMarkers = new (rbush__WEBPACK_IMPORTED_MODULE_0___default())();

          /**
           * 当前显示在地图上的marker的范围集合
           *
           * @type {rbush<MarkerBoundsData>}
           */
          this._showMarkerBounds = new (rbush__WEBPACK_IMPORTED_MODULE_0___default())();
        },

        setOptions(options) {
          L.setOptions(this, options);

          return this.redraw();
        },

        /** 重绘 */
        redraw() {
          return this._redraw(true);
        },

        /**
         * 获取事件对象
         *
         * 表示给map添加的监听器
         *
         * @returns {Object} 监听器/函数键值对
         */
        getEvents() {
          const events = {
            viewreset: this._reset,
            zoom: this._onZoom,
            moveend: this._reset,
            click: this._executeListeners,
            mousemove: this._mousemove,
            mousedown: this._executeListeners,
            mouseup: this._executeListeners
          };
          if (this._zoomAnimated) {
            events.zoomanim = this._onAnimZoom;
          }
          if (this.options.moveReset) {
            events.move = this._reset;
          }
          return events;
        },

        /**
         * 添加标注
         *
         * @param {L/Marker} layer 标注
         * @returns {Object} this
         */
        addLayer(layer, redraw = true) {
          if (!(layer.options.pane == 'markerPane' && layer.options.icon)) {
            console.error("Layer isn't a marker");
            return;
          }

          layer._map = this._map;
          const latlng = layer.getLatLng();

          L.Util.stamp(layer);

          this._markers.insert({
            minX: latlng.lng,
            minY: latlng.lat,
            maxX: latlng.lng,
            maxY: latlng.lat,
            data: layer
          });

          this._markers.dirty++;
          this._markers.total++;

          const isDisplaying = this._map.getBounds().contains(latlng);
          if (redraw == true && isDisplaying) {
            this._redraw(true);
          }
          return this;
        },

        /**
         * 添加标注数组,在一次性添加许多标注时使用此函数会比循环调用marker函数效率更高
         *
         * @param {(L/Marker)[]} layers 标注数组
         * @returns {Object} this
         */
        addLayers(layers, redraw = true) {
          layers.forEach(layer => {
            this.addLayer(layer, false);
          });
          if (redraw) {
            this._redraw(true);
          }
          return this;
        },

        /**
         * 删除标注
         *
         * @param {any} layer 标注
         * @param {boolean=true} redraw 是否重新绘制(默认为true),如果要批量删除可以设置为false,然后手动更新
         * @returns {Object} this
         */
        removeLayer(layer, redraw = true) {
          const self = this;

          // If we are removed point
          if (layer.minX) layer = layer.data;

          const latlng = layer.getLatLng();
          const isDisplaying = self._map.getBounds().contains(latlng);

          const markerData = {
            minX: latlng.lng,
            minY: latlng.lat,
            maxX: latlng.lng,
            maxY: latlng.lat,
            data: layer
          };

          self._markers.remove(markerData, function (a, b) {
            return a.data._leaflet_id === b.data._leaflet_id;
          });

          self._markers.total--;
          self._markers.dirty++;

          if (isDisplaying === true && redraw === true) {
            self._redraw(true);
          }
          return this;
        },

        /** 清除所有 */
        clearLayers() {
          this._markers = new (rbush__WEBPACK_IMPORTED_MODULE_0___default())();
          this._markers.dirty = 0; // 单个插入/删除
          this._markers.total = 0; // 总数
          this._containMarkers = new (rbush__WEBPACK_IMPORTED_MODULE_0___default())();
          this._showMarkers = new (rbush__WEBPACK_IMPORTED_MODULE_0___default())();
          this._showMarkerBounds = new (rbush__WEBPACK_IMPORTED_MODULE_0___default())();

          this._redraw(true);
        },

        /**
         * 继承L.Layer必须实现的方法
         *
         * 图层Dom节点创建添加到地图容器
         */
        onAdd(map) {
          this._map = map;

          if (!this._container) this._initCanvas();

          if (this.options.pane) this.getPane().appendChild(this._container);
          else map._panes.overlayPane.appendChild(this._container);

          this._reset();
        },

        /**
         * 继承L.Layer必须实现的方法
         *
         * 图层Dom节点销毁
         */
        onRemove(map) {
          if (this.options.pane) this.getPane().removeChild(this._container);
          else map.getPanes().overlayPane.removeChild(this._container);
        },

        /**
         * 绘制图标
         *
         * @param {L/Marker} marker 图标
         * @param {L/Point} pointPos 图标中心点在屏幕上的像素位置
         */
        _drawMarker(marker, pointPos) {
          const self = this;
          // 创建图标缓存
          if (!this._imageLookup) this._imageLookup = {};

          // 没有传入像素位置,则计算marker自身的位置
          if (!pointPos) {
            pointPos = self._map.latLngToContainerPoint(marker.getLatLng());
          }
          const options = marker.options.icon.options;
          let maxX;
          let maxY;
          let minX;
          let minY;
          minX = pointPos.x - options.iconAnchor[0];
          maxX = minX + options.iconSize[0];
          minY = pointPos.y - options.iconAnchor[1];
          maxY = minY + options.iconSize[1];

          const markerBounds = {
            minX,
            minY,
            maxX,
            maxY
          };

          if (this.options.collisionFlg == true) {
            if (this._showMarkerBounds.collides(markerBounds)) {
              return;
            }
            this._showMarkerBounds.insert(markerBounds);
            const latlng = marker.getLatLng();
            this._showMarkers.insert({
              minX,
              minY,
              maxX,
              maxY,
              lng: latlng.lng,
              lat: latlng.lat,
              data: marker
            });
          }

          // 图标图片地址
          const iconUrl = marker.options.icon.options.iconUrl;

          // 已经有canvas_img对象,表示之前已经绘制过,直接使用,提高渲染效率
          if (marker.canvas_img) {
            self._drawImage(marker, pointPos);
          } else {
            // 图标已经在缓存中
            if (self._imageLookup[iconUrl]) {
              marker.canvas_img = self._imageLookup[iconUrl][0];

              // 图片还未加载,把marker添加到预加载列表中
              if (self._imageLookup[iconUrl][1] === false) {
                self._imageLookup[iconUrl][2].push([marker, pointPos]);
              } else {
                // 图片已经加载,则直接绘制
                self._drawImage(marker, pointPos);
              }
            } else {
              // 新的图片
              // 创建图片对象
              const i = new Image();
              i.src = iconUrl;
              marker.canvas_img = i;

              // Image:图片,isLoaded:是否已经加载,[[marker,pointPos]]:预加载列表
              self._imageLookup[iconUrl] = [i, false, [[marker, pointPos]]];

              // 图片加载完毕,循环预加列表,绘制图标
              i.onload = function () {
                self._imageLookup[iconUrl][1] = true;
                self._imageLookup[iconUrl][2].forEach(function (e) {
                  self._drawImage(e[0], e[1]);
                });
              };
            }
          }
        },

        /**
         * 绘制图标
         *
         * @param {L/Marker} marker 图标
         * @param {L/Point} pointPos 图标中心点在屏幕上的像素位置
         */
        _drawImage(marker, pointPos) {
          const options = marker.options.icon.options;
          this._ctx.save();
          this._ctx.globalAlpha = this.options.opacity;
          this._ctx.translate(pointPos.x, pointPos.y);
          this._ctx.rotate(options.rotate);

          this._ctx.drawImage(
            marker.canvas_img,
            -options.iconAnchor[0],
            -options.iconAnchor[1],
            options.iconSize[0],
            options.iconSize[1]
          );
          this._ctx.restore();
        },

        /** 重置画布(大小,位置,内容) */
        _reset() {
          const topLeft = this._map.containerPointToLayerPoint([0, 0]);
          L.DomUtil.setPosition(this._container, topLeft);
          const size = this._map.getSize();
          this._container.width = size.x;
          this._container.height = size.y;
          this._update();
        },

        /**
         * 重绘画布
         *
         * @param {boolean} clear 是否清空
         */
        _redraw(clear) {
          this._showMarkerBounds = new (rbush__WEBPACK_IMPORTED_MODULE_0___default())();
          this._showMarkers = new (rbush__WEBPACK_IMPORTED_MODULE_0___default())();
          const self = this;
          // 清空画布
          if (clear) this._ctx.clearRect(0, 0, this._container.width, this._container.height);
          if (!this._map || !this._markers) return;

          let tmp = [];

          // 如果单个插入/删除的数量超过总数的10%,则重建查找以提高效率
          if (self._markers.dirty / self._markers.total >= 0.1) {
            self._markers.all().forEach(function (e) {
              tmp.push(e);
            });

            self._markers.clear();
            self._markers.load(tmp);
            self._markers.dirty = 0;
            tmp = [];
          }

          // 地图地理坐标边界
          const mapBounds = self._map.getBounds();

          // 适用于runsh的边界对象
          const mapBoxCoords = {
            minX: mapBounds.getWest(),
            minY: mapBounds.getSouth(),
            maxX: mapBounds.getEast(),
            maxY: mapBounds.getNorth()
          };

          // 查询范围内的图标
          self._markers.search(mapBoxCoords).forEach(function (e) {
            // 图标屏幕坐标
            const pointPos = self._map.latLngToContainerPoint(e.data.getLatLng());
            const iconSize = e.data.options.icon.options.iconSize;
            const iconAnchor = e.data.options.icon.options.iconAnchor;
            let maxX;
            let maxY;
            let minX;
            let minY;
            minX = pointPos.x - iconAnchor[0];
            maxX = minX + iconSize[0];
            minY = pointPos.y - iconAnchor[1];
            maxY = minY + iconSize[1];

            const newCoords = {
              minX,
              minY,
              maxX,
              maxY,
              data: e.data,
              pointPos
            };

            tmp.push(newCoords);
          });

          // 需要做碰撞检测则降序排序,zIndex值大的优先绘制;不需要碰撞检测则升序排序，zIndex值的的后绘制
          tmp
            .sort((layer1, layer2) => {
              const zIndex1 = layer1.data.options.zIndex ? layer1.data.options.zIndex : 1;
              const zIndex2 = layer2.data.options.zIndex ? layer2.data.options.zIndex : 1;
              return (-zIndex1 + zIndex2) * (this.options.collisionFlg ? 1 : -1);
            })
            .forEach(layer => {
              // 图标屏幕坐标
              const pointPos = layer.pointPos;
              self._drawMarker(layer.data, pointPos);
            });
          // Clear rBush & Bulk Load for performance
          this._containMarkers.clear();
          this._containMarkers.load(tmp);
          if (this.options.collisionFlg != true) {
            this._showMarkers = this._containMarkers;
          }
          return this;
        },

        /** 初始化容器 */
        _initCanvas() {
          this._container = L.DomUtil.create('canvas', 'leaflet-canvas-icon-layer leaflet-layer');
          if (this.options.zIndex) {
            this._container.style.zIndex = this.options.zIndex;
          }

          const size = this._map.getSize();
          this._container.width = size.x;
          this._container.height = size.y;

          this._ctx = this._container.getContext('2d');

          const animated = this._map.options.zoomAnimation && L.Browser.any3d;
          L.DomUtil.addClass(this._container, `leaflet-zoom-${animated ? 'animated' : 'hide'}`);
        },

        /** 添加click侦听器 */
        addOnClickListener(listener) {
          this._onClickListeners.push(listener);
        },

        /** 添加hover侦听器 */
        addOnHoverListener(listener) {
          this._onHoverListeners.push(listener);
        },

        /** 添加mousedown侦听器 */
        addOnMouseDownListener(listener) {
          this._onMouseDownListeners.push(listener);
        },

        /** 添加mouseup侦听器 */
        addOnMouseUpListener(listener) {
          this._onMouseUpListeners.push(listener);
        },

        /** 执行侦听器 */
        _executeListeners(event) {
          if (!this._showMarkers) return;
          const me = this;
          const x = event.containerPoint.x;
          const y = event.containerPoint.y;

          if (me._openToolTip) {
            me._openToolTip.closeTooltip();
            delete me._openToolTip;
          }

          const ret = this._showMarkers.search({
            minX: x,
            minY: y,
            maxX: x,
            maxY: y
          });

          if (ret && ret.length > 0) {
            // 倒序ret
            ret.reverse();
            if (event.type === 'click') {
              clearTimeout(isClick);
              isClick = setTimeout(() => {
                const hasPopup = ret[0].data.getPopup();
                if (hasPopup) ret[0].data.openPopup();

                me._onClickListeners.forEach(function (listener) {
                  listener(event, ret);
                });
              });
            }
            if (event.type === 'mousedown') {
              if (isMousedown) return;
              isMousedown = true;
              me._onMouseDownListeners.forEach(function (listener) {
                listener(event, ret);
              });
              setTimeout(() => {
                isMousedown = false;
              });
            }
            if (event.type === 'mouseup') {
              if (isMouseup) return;
              isMouseup = true;
              me._onMouseUpListeners.forEach(function (listener) {
                listener(event, ret);
              });
              setTimeout(() => {
                isMouseup = false;
              });
            }
          }
        },
        /** 监听鼠标移动事件 */
        _mousemove(event) {
          if (isMousemove) return;
          if (!this._showMarkers) return;
          const me = this;
          const x = event.containerPoint.x;
          const y = event.containerPoint.y;

          if (me._openToolTip) {
            me._openToolTip.closeTooltip();
            delete me._openToolTip;
          }

          const ret = this._showMarkers.search({
            minX: x,
            minY: y,
            maxX: x,
            maxY: y
          });

          if (ret && ret.length > 0) {
            // 倒序ret
            ret.reverse();
            me._map._container.style.cursor = 'pointer';
            if (event.type === 'mousemove') {
              isMousemove = true;
              const hasTooltip = ret[0].data.getTooltip();
              if (hasTooltip) {
                me._openToolTip = ret[0].data;
                ret[0].data.openTooltip();
              }

              me._onHoverListeners.forEach(function (listener) {
                listener(event, ret);
              });
            }
            setTimeout(() => {
              isMousemove = false;
            });
          } else {
            me._map._container.style.cursor = '';
          }
        },

        /**
         * 地图Zoomanim事件监听器函数
         *
         * @param {Object} env {center:L.LatLng,zoom:number}格式的对象
         */
        _onAnimZoom(ev) {
          this._updateTransform(ev.center, ev.zoom);
        },

        /** 地图修改zoom事件监听器函数 */
        _onZoom() {
          this._updateTransform(this._map.getCenter(), this._map.getZoom());
        },

        /**
         * 修改dom原始的transform或position
         *
         * @param {L/LatLng} center 中心点
         * @param {number} zoom 地图缩放级别
         */
        _updateTransform(center, zoom) {
          const scale = this._map.getZoomScale(zoom, this._zoom);
          const position = L.DomUtil.getPosition(this._container);
          const viewHalf = this._map.getSize().multiplyBy(0.5);
          const currentCenterPoint = this._map.project(this._center, zoom);
          const destCenterPoint = this._map.project(center, zoom);
          const centerOffset = destCenterPoint.subtract(currentCenterPoint);
          const topLeftOffset = viewHalf.multiplyBy(-scale).add(position).add(viewHalf).subtract(centerOffset);

          if (L.Browser.any3d) {
            L.DomUtil.setTransform(this._container, topLeftOffset, scale);
          } else {
            L.DomUtil.setPosition(this._container, topLeftOffset);
          }
        },

        /** 更新渲染器容器的像素边界（用于以后的定位/大小/剪裁）子类负责触发“update”事件。 */
        _update() {
          const p = 0;
          const size = this._map.getSize();
          const min = this._map.containerPointToLayerPoint(size.multiplyBy(-p)).round();

          this._bounds = new L.Bounds(min, min.add(size.multiplyBy(1 + p * 2)).round());

          this._center = this._map.getCenter();
          this._zoom = this._map.getZoom();

          this._redraw();
        },
        /**
         * 设置图层透明度
         *
         * @param {Number} opacity 图层透明度
         */
        setOpacity(opacity) {
          this.options.opacity = opacity;
          return this._redraw(true);
        }
      }));

      var canvasMarkerLayer = (L.canvasMarkerLayer = function (options) {
        return new L.CanvasMarkerLayer(options);
      });
    })();

    /***/ return __webpack_exports__;
    /***/
  })();
});
// # sourceMappingURL=Leaflet.canvasmarker.js.map
