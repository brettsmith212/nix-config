import {
  getGlobalOption,
  displayMessage,
  hasSession,
  newSession,
  setSessionOption,
  displayPopup,
} from './tmux';
import { sessionNameForPath } from './sessions';

export function launch(cwd: string, origin?: string): void {
  const prefix = getGlobalOption('@opencode_session_prefix', 'opencode-');
  const command = getGlobalOption('@opencode_command', 'opencode');
  const width = getGlobalOption('@opencode_popup_width', '90%');
  const height = getGlobalOption('@opencode_popup_height', '90%');

  const currentSession = displayMessage('#S');
  if (currentSession.startsWith(prefix)) {
    displayMessage('Popup window already open');
    return;
  }

  const sessionName = sessionNameForPath(cwd, prefix);

  if (!hasSession(sessionName)) {
    newSession(sessionName, cwd, command);
  }

  setSessionOption(sessionName, '@opencode_path', cwd);
  if (origin) {
    setSessionOption(sessionName, '@opencode_origin', origin);
  }

  displayPopup({
    width,
    height,
    command: `tmux attach-session -t ${sessionName}`,
  });
}
