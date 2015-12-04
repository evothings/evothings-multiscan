defmodule Multiscan.ScanChannel do
  use Phoenix.Channel

  # For now we just use a single public scan "room"
  def join("scan:public", _message, socket) do
    {:ok, socket}
  end

  # All other scan rooms are considered private
  def join("scan:" <> _private_scan_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  def handle_in("scan:device", msg, socket) do
    broadcast! socket, "scan:device", msg
    {:noreply, socket}
  end
end
