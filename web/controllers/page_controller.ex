defmodule Multiscan.PageController do
  use Multiscan.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
