#!/usr/bin/env zsh
exec codex "$1" -m gpt-5.5 "${@:2}"
