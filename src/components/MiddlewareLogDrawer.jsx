import React, { useState } from "react";
import { useCartStore } from "../store/useCartStore";

export default function MiddlewareLogDrawer({ isOpen, onClose }) {
  const actionLogs = useCartStore((state) => state.actionLogs || []);
  const clearLogs = useCartStore((state) => state.clearLogs);
  const [selectedLog, setSelectedLog] = useState(null);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card log-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <span className="eyebrow">EXPERIMENT 2 · MIDDLEWARE MONITOR</span>
            <h2>Cart Action Audit Log</h2>
            <p className="muted">
              Monitoring all store dispatches via custom Zustand middleware.
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close drawer">✕</button>
        </div>

        <div className="drawer-toolbar">
          <span className="log-count-tag">{actionLogs.length} actions captured</span>
          <button className="text-button remove" onClick={clearLogs} disabled={actionLogs.length === 0}>
            Clear Logs
          </button>
        </div>

        <div className="drawer-body">
          {actionLogs.length === 0 ? (
            <div className="empty-logs">
              <div className="empty-icon">⚡</div>
              <h3>No actions monitored yet</h3>
              <p className="muted">
                Add items to cart, change quantities, or apply discount coupons to see middleware logs trigger live!
              </p>
            </div>
          ) : (
            <div className="log-list">
              {actionLogs.map((log) => (
                <div
                  key={log.id}
                  className={`log-item ${selectedLog?.id === log.id ? "selected" : ""}`}
                  onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                >
                  <div className="log-item-header">
                    <span className="log-badge-action">{log.action}</span>
                    <span className="log-time">{log.timestamp}</span>
                  </div>
                  <div className="log-item-meta">
                    <span>Cart Count: {log.prevCartCount} ➜ <strong>{log.nextCartCount}</strong></span>
                    <span>Unique Items: {log.totalItems}</span>
                  </div>
                  {selectedLog?.id === log.id && (
                    <div className="log-detail-expanded">
                      <p><strong>Payload / Transition Details:</strong></p>
                      <pre>{JSON.stringify(log.payload || {}, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="drawer-footer">
          <code>Middleware Code: src/store/useCartStore.js (cartActionLoggerMiddleware)</code>
        </div>
      </div>
    </div>
  );
}
