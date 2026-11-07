/**
 * Generates an inline script tag containing the Mock SCORM 1.2 and 2004 LMS Runtime
 * for embedding inside the sandboxed preview iframe.
 * Telemetry events are forwarded to the parent window via postMessage.
 */
export function getMockScormRuntimeScript(): string {
  return `<script>
(function() {
  var logLms = function(action, param, result) {
    try {
      window.parent.postMessage({
        source: 'SCORM_MOCK_LMS',
        type: 'LOG',
        payload: {
          action: action,
          param: param,
          result: result,
          timestamp: new Date().toISOString()
        }
      }, '*');
    } catch(e) {}
  };

  var cmiData = {
    'cmi.core.lesson_status': 'not attempted',
    'cmi.core.lesson_location': '',
    'cmi.core.score.raw': '0',
    'cmi.suspend_data': '',
    // SCORM 2004 aliases
    'cmi.completion_status': 'unknown',
    'cmi.success_status': 'unknown',
    'cmi.location': '',
    'cmi.score.raw': '0',
    'cmi.score.scaled': '0'
  };

  // SCORM 1.2 Standard Adapter
  window.API = {
    LMSInitialize: function() {
      cmiData['cmi.core.lesson_status'] = 'incomplete';
      logLms('LMSInitialize', '""', 'true');
      return "true";
    },
    LMSFinish: function() {
      logLms('LMSFinish', '""', 'true');
      return "true";
    },
    LMSGetValue: function(element) {
      var val = cmiData[element] !== undefined ? cmiData[element] : "";
      logLms('LMSGetValue', element, val);
      return String(val);
    },
    LMSSetValue: function(element, value) {
      cmiData[element] = String(value);
      logLms('LMSSetValue', element + ' = ' + value, 'true');
      return "true";
    },
    LMSCommit: function() {
      logLms('LMSCommit', '""', 'true');
      return "true";
    },
    LMSGetLastError: function() { return "0"; },
    LMSGetErrorString: function() { return "No error"; },
    LMSGetDiagnostic: function() { return "OK"; }
  };

  // SCORM 2004 Standard Adapter
  window.API_1484_11 = {
    Initialize: function() {
      cmiData['cmi.completion_status'] = 'incomplete';
      logLms('Initialize', '""', 'true');
      return "true";
    },
    Terminate: function() {
      logLms('Terminate', '""', 'true');
      return "true";
    },
    GetValue: function(element) {
      var val = cmiData[element] !== undefined ? cmiData[element] : "";
      logLms('GetValue', element, val);
      return String(val);
    },
    SetValue: function(element, value) {
      cmiData[element] = String(value);
      logLms('SetValue', element + ' = ' + value, 'true');
      return "true";
    },
    Commit: function() {
      logLms('Commit', '""', 'true');
      return "true";
    },
    GetLastError: function() { return "0"; },
    GetErrorString: function() { return "No error"; },
    GetDiagnostic: function() { return "OK"; }
  };
})();
</script>`;
}
