local prefix = hs.hotkey.modal.new()

prefix:bind({}, "n", function()
  hs.eventtap.keyStroke({"cmd", "shift"}, "]")  -- next tab
  prefix:exit()
end)

prefix:bind({}, "p", function()
  hs.eventtap.keyStroke({"cmd", "shift"}, "[")  -- previous tab
  prefix:exit()
end)

prefix:bind({}, "escape", function() prefix:exit() end)

-- Ctrl-A hotkey, only enabled while Safari is frontmost
local ctrlA = hs.hotkey.new({"ctrl"}, "a", function()
  prefix:enter()
  hs.alert.show("Ctrl-A", 0.5)
end)

local function updateForApp(appName)
  if appName == "Safari" then
    ctrlA:enable()
  else
    ctrlA:disable()
    prefix:exit()
  end
end

appWatcher = hs.application.watcher.new(function(name, eventType, app)
  if eventType == hs.application.watcher.activated then
    updateForApp(name)
  end
end)
appWatcher:start()

-- Initial state
local front = hs.application.frontmostApplication()
updateForApp(front and front:name() or "")
