webpackHotUpdate("main",{

/***/ "./src/components/Comparison/Listvideo.js":
/*!************************************************!*\
  !*** ./src/components/Comparison/Listvideo.js ***!
  \************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(__react_refresh_utils__, __react_refresh_error_overlay__) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Listvideo; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _mui_material_Container__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @mui/material/Container */ "./node_modules/@mui/material/Container/index.js");
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @mui/material */ "./node_modules/@mui/material/index.js");
/* harmony import */ var _material_ui_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @material-ui/core */ "./node_modules/@material-ui/core/esm/index.js");
/* harmony import */ var _Querybar_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Querybar.css */ "./src/components/Comparison/Querybar.css");
/* harmony import */ var _Querybar_css__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_Querybar_css__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _mui_material_Chip__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @mui/material/Chip */ "./node_modules/@mui/material/Chip/index.js");
/* harmony import */ var _mui_material_Box__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @mui/material/Box */ "./node_modules/@mui/material/Box/index.js");
/* harmony import */ var _mui_material_Typography__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @mui/material/Typography */ "./node_modules/@mui/material/Typography/index.js");
/* harmony import */ var _mui_material_Grid__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @mui/material/Grid */ "./node_modules/@mui/material/Grid/index.js");
/* harmony import */ var _mui_material_Paper__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @mui/material/Paper */ "./node_modules/@mui/material/Paper/index.js");
/* harmony import */ var _Videoavailable_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./Videoavailable.js */ "./src/components/Comparison/Videoavailable.js");
/* harmony import */ var _VideoFiltered_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./VideoFiltered.js */ "./src/components/Comparison/VideoFiltered.js");
/* harmony import */ var _account_management_TokenContext__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../account-management/TokenContext */ "./src/components/account-management/TokenContext.js");
/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! react/jsx-dev-runtime */ "./node_modules/react/jsx-dev-runtime.js");
/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_13__);
__webpack_require__.$Refresh$.runtime = __webpack_require__(/*! ./node_modules/react-refresh/runtime.js */ "./node_modules/react-refresh/runtime.js");
__webpack_require__.$Refresh$.setup(module.i);

var _jsxFileName = "/home/mosenco/Desktop/edurell/EVA_apps/EKEELVideoAugmentation/src/react-app/src/components/Comparison/Listvideo.js",
  _s = __webpack_require__.$Refresh$.signature();
















function Listvideo(_ref) {
  _s();
  let {
    catalogExtra,
    catalog,
    loading,
    querylist,
    catalogoriginal
  } = _ref;
  const context = Object(react__WEBPACK_IMPORTED_MODULE_0__["useContext"])(_account_management_TokenContext__WEBPACK_IMPORTED_MODULE_12__["TokenContext"]);
  console.log("listvideo querylist ", querylist);
  return /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_13__["jsxDEV"])(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_13__["Fragment"], {
    children: /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_13__["jsxDEV"])(_mui_material_Container__WEBPACK_IMPORTED_MODULE_1__["default"], {
      maxWidth: "xl",
      children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_13__["jsxDEV"])(_mui_material_Grid__WEBPACK_IMPORTED_MODULE_8__["default"], {
        container: true,
        direction: "row",
        justifyContent: "center",
        alignItems: "center",
        spacing: 2,
        sx: {
          p: 5
        },
        children: loading ? null : querylist.length > 0 ? catalog.map(video => {
          console.log("LISTVIDEO: ", catalogExtra);
          let singlecatExtra = catalogExtra.filter(extra => video.video_id == extra.video_id);
          console.log(video.video_id, " extra ", singlecatExtra);
          return /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_13__["jsxDEV"])(_mui_material_Grid__WEBPACK_IMPORTED_MODULE_8__["default"], {
            item: true,
            xs: 12,
            xl: 2,
            md: 3,
            children: /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_13__["jsxDEV"])(_VideoFiltered_js__WEBPACK_IMPORTED_MODULE_11__["default"], {
              tottime: video.duration,
              conceptextra: singlecatExtra,
              titleurl: video.title,
              imageurl: video.video_id,
              idxurl: video._id.$oid,
              concepts: video.extracted_keywords,
              creator: video.creator
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 48,
              columnNumber: 25
            }, this)
          }, video._id.$oid, false, {
            fileName: _jsxFileName,
            lineNumber: 47,
            columnNumber: 21
          }, this);
        }) : catalog.map(video => {
          return /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_13__["jsxDEV"])(_mui_material_Grid__WEBPACK_IMPORTED_MODULE_8__["default"], {
            item: true,
            xs: 12,
            xl: 2,
            md: 3,
            children: /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_13__["jsxDEV"])(_Videoavailable_js__WEBPACK_IMPORTED_MODULE_10__["default"], {
              titleurl: video.title,
              imageurl: video.video_id,
              idxurl: video._id.$oid,
              concepts: video.extracted_keywords,
              creator: video.creator
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 61,
              columnNumber: 21
            }, this)
          }, video._id.$oid, false, {
            fileName: _jsxFileName,
            lineNumber: 60,
            columnNumber: 17
          }, this);
        })
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 27,
        columnNumber: 13
      }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_13__["jsxDEV"])(_mui_material_Grid__WEBPACK_IMPORTED_MODULE_8__["default"], {
        container: true,
        direction: "column",
        justifyContent: "center",
        alignItems: "center",
        children: querylist.length > 0 ? /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_13__["jsxDEV"])(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_13__["Fragment"], {
          children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_13__["jsxDEV"])(_mui_material_Grid__WEBPACK_IMPORTED_MODULE_8__["default"], {
            item: true,
            children: /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_13__["jsxDEV"])(_mui_material_Box__WEBPACK_IMPORTED_MODULE_6__["default"], {
              sx: {
                m: 0,
                p: 0,
                width: '100px',
                height: '2px',
                backgroundColor: "#9BDDC1"
              }
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 81,
              columnNumber: 17
            }, this)
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 80,
            columnNumber: 13
          }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_13__["jsxDEV"])(_mui_material_Grid__WEBPACK_IMPORTED_MODULE_8__["default"], {
            item: true,
            children: /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_13__["jsxDEV"])(_mui_material_Typography__WEBPACK_IMPORTED_MODULE_7__["default"], {
              variant: "subtitle2",
              gutterBottom: true,
              children: "Sembra non ci siano altri video con il concetti che cerchi :("
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 92,
              columnNumber: 13
            }, this)
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 91,
            columnNumber: 9
          }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_13__["jsxDEV"])(_mui_material_Grid__WEBPACK_IMPORTED_MODULE_8__["default"], {
            item: true,
            children: /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_13__["jsxDEV"])(_mui_material_Typography__WEBPACK_IMPORTED_MODULE_7__["default"], {
              variant: "overline",
              display: "block",
              gutterBottom: true,
              sx: {
                color: "black"
              },
              children: "Ti serve altro? Dai un'occhiata agli altri concetti presenti in questi video!"
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 98,
              columnNumber: 13
            }, this)
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 97,
            columnNumber: 9
          }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_13__["jsxDEV"])(_mui_material_Grid__WEBPACK_IMPORTED_MODULE_8__["default"], {
            item: true
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 102,
            columnNumber: 9
          }, this)]
        }, void 0, true) : /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_13__["jsxDEV"])(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_13__["Fragment"], {}, void 0, false)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 72,
        columnNumber: 9
      }, this)]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 26,
      columnNumber: 5
    }, this)
  }, void 0, false);
}
_s(Listvideo, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
_c = Listvideo;
var _c;
__webpack_require__.$Refresh$.register(_c, "Listvideo");

const currentExports = __react_refresh_utils__.getModuleExports(module.i);
__react_refresh_utils__.registerExportsForReactRefresh(currentExports, module.i);

if (true) {
  const isHotUpdate = !!module.hot.data;
  const prevExports = isHotUpdate ? module.hot.data.prevExports : null;

  if (__react_refresh_utils__.isReactRefreshBoundary(currentExports)) {
    module.hot.dispose(
      /**
       * A callback to performs a full refresh if React has unrecoverable errors,
       * and also caches the to-be-disposed module.
       * @param {*} data A hot module data object from Webpack HMR.
       * @returns {void}
       */
      function hotDisposeCallback(data) {
        // We have to mutate the data object to get data registered and cached
        data.prevExports = currentExports;
      }
    );
    module.hot.accept(
      /**
       * An error handler to allow self-recovering behaviours.
       * @param {Error} error An error occurred during evaluation of a module.
       * @returns {void}
       */
      function hotErrorHandler(error) {
        if (
          typeof __react_refresh_error_overlay__ !== 'undefined' &&
          __react_refresh_error_overlay__
        ) {
          __react_refresh_error_overlay__.handleRuntimeError(error);
        }

        if (typeof __react_refresh_test__ !== 'undefined' && __react_refresh_test__) {
          if (window.onHotAcceptError) {
            window.onHotAcceptError(error.message);
          }
        }

        __webpack_require__.c[module.i].hot.accept(hotErrorHandler);
      }
    );

    if (isHotUpdate) {
      if (
        __react_refresh_utils__.isReactRefreshBoundary(prevExports) &&
        __react_refresh_utils__.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)
      ) {
        module.hot.invalidate();
      } else {
        __react_refresh_utils__.enqueueUpdate(
          /**
           * A function to dismiss the error overlay after performing React refresh.
           * @returns {void}
           */
          function updateCallback() {
            if (
              typeof __react_refresh_error_overlay__ !== 'undefined' &&
              __react_refresh_error_overlay__
            ) {
              __react_refresh_error_overlay__.clearRuntimeErrors();
            }
          }
        );
      }
    }
  } else {
    if (isHotUpdate && __react_refresh_utils__.isReactRefreshBoundary(prevExports)) {
      module.hot.invalidate();
    }
  }
}
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@pmmmwh/react-refresh-webpack-plugin/lib/runtime/RefreshUtils.js */ "./node_modules/@pmmmwh/react-refresh-webpack-plugin/lib/runtime/RefreshUtils.js"), __webpack_require__(/*! ./node_modules/react-dev-utils/refreshOverlayInterop.js */ "./node_modules/react-dev-utils/refreshOverlayInterop.js")))

/***/ })

})
//# sourceMappingURL=main.eafcb31fcd233473beb4.hot-update.js.map