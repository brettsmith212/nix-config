{ pkgs }:

pkgs.writeShellApplication {
  name = "gtd-reminder";
  text = ''
    usage() {
      cat <<'EOF'
    Usage: gtd-reminder --title TITLE [--date YYYY-MM-DD] [--time HH:MM] [--notes TEXT] [--list NAME]

    Creates an Apple Reminder. A date without --time creates an all-day reminder.
    The default Reminders list is used when --list is omitted.
    EOF
    }

    title=""
    due_date=""
    due_time=""
    notes=""
    list_name=""

    while (( $# > 0 )); do
      case "$1" in
        --title)
          if (( $# < 2 )); then
            echo "gtd-reminder: --title requires a value" >&2
            exit 2
          fi
          title="$2"
          shift 2
          ;;
        --date)
          if (( $# < 2 )); then
            echo "gtd-reminder: --date requires a value" >&2
            exit 2
          fi
          due_date="$2"
          shift 2
          ;;
        --time)
          if (( $# < 2 )); then
            echo "gtd-reminder: --time requires a value" >&2
            exit 2
          fi
          due_time="$2"
          shift 2
          ;;
        --notes)
          if (( $# < 2 )); then
            echo "gtd-reminder: --notes requires a value" >&2
            exit 2
          fi
          notes="$2"
          shift 2
          ;;
        --list)
          if (( $# < 2 )); then
            echo "gtd-reminder: --list requires a value" >&2
            exit 2
          fi
          list_name="$2"
          shift 2
          ;;
        -h|--help)
          usage
          exit 0
          ;;
        *)
          echo "gtd-reminder: unknown argument: $1" >&2
          usage >&2
          exit 2
          ;;
      esac
    done

    if [[ -z "$title" ]]; then
      echo "gtd-reminder: --title is required" >&2
      usage >&2
      exit 2
    fi

    if [[ -n "$due_date" ]] && ! /bin/date -j -f "%Y-%m-%d" "$due_date" "+%Y-%m-%d" >/dev/null 2>&1; then
      echo "gtd-reminder: --date must be a valid date in YYYY-MM-DD format" >&2
      exit 2
    fi

    if [[ -z "$due_date" && -n "$due_time" ]]; then
      echo "gtd-reminder: --time requires --date" >&2
      exit 2
    fi

    if [[ -n "$due_time" ]] && ! /bin/date -j -f "%H:%M" "$due_time" "+%H:%M" >/dev/null 2>&1; then
      echo "gtd-reminder: --time must be a valid time in 24-hour HH:MM format" >&2
      exit 2
    fi

    /usr/bin/osascript - "$title" "$due_date" "$due_time" "$notes" "$list_name" <<'APPLESCRIPT'
    on run argv
      set reminderTitle to item 1 of argv
      set dueDateText to item 2 of argv
      set dueTimeText to item 3 of argv
      set reminderNotes to item 4 of argv
      set listName to item 5 of argv

      tell application "Reminders"
        if listName is "" then
          set targetList to default list
        else
          if not (exists list listName) then error "Reminders list not found: " & listName
          set targetList to list listName
        end if

        if dueDateText is "" then
          set createdReminder to make new reminder at end of reminders of targetList with properties {name:reminderTitle, body:reminderNotes}
        else
          set dueAt to current date
          set year of dueAt to (text 1 thru 4 of dueDateText) as integer
          set month of dueAt to (text 6 thru 7 of dueDateText) as integer
          set day of dueAt to (text 9 thru 10 of dueDateText) as integer
          if dueTimeText is "" then
            set createdReminder to make new reminder at end of reminders of targetList with properties {name:reminderTitle, body:reminderNotes, allday due date:dueAt}
          else
            set hours of dueAt to (text 1 thru 2 of dueTimeText) as integer
            set minutes of dueAt to (text 4 thru 5 of dueTimeText) as integer
            set seconds of dueAt to 0
            set createdReminder to make new reminder at end of reminders of targetList with properties {name:reminderTitle, body:reminderNotes, due date:dueAt}
          end if
        end if

        return "Created reminder in " & name of targetList & ": " & name of createdReminder
      end tell
    end run
    APPLESCRIPT
  '';
}
