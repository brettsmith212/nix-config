local prefix = hs.hotkey.modal.new()

-- Only activate prefix in Safari
hs.hotkey.bind({"ctrl"}, "a", function()
  if hs.application.frontmostApplication():name() == "Safari" then
    prefix:enter()
    hs.alert.show("Ctrl-A", 0.5)
  else
    -- pass through (e.g. beginning-of-line in terminals/inputs)
    hs.eventtap.keyStroke({"ctrl"}, "a", 0)
  end
end)

prefix:bind({}, "n", function()
  hs.eventtap.keyStroke({"cmd", "shift"}, "]")  -- next tab
  prefix:exit()
end)

prefix:bind({}, "p", function()
  hs.eventtap.keyStroke({"cmd", "shift"}, "[")  -- previous tab
  prefix:exit()
end)

prefix:bind({}, "escape", function() prefix:exit() end)
