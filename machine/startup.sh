#!/bin/bash
USB_PORT=$(dmesg | grep "ch341-uart" | grep "attached" | sed -r "s/.* (tty.*)/\1/")
ttymidi -s /dev/$USB_PORT &

export MIDI_PORT=$(aconnect -i -o | grep "ttymidi" | sed -r "s/.*client ([0-9]+): 'ttymidi'.*/\1/")
