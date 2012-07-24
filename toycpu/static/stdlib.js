var STDLIB_SRC = '; Jump to the program start, skipping over the standard library code\njump PROGRAM_START\n\n;***************************************************************************\n; Video device handling\n;***************************************************************************\n\n; Color constant definitions\n.const WHITE , 0xFFFF\n.const BLACK , 0x000F\n.const RED   , 0xF00F\n.const GREEN , 0x0F0F\n.const BLUE  , 0x00FF\n.const YELLOW, 0xFF0F\n.const CYAN  , 0x0FFF\n.const GREY  , 0x888F\n\n; @function Show the contents of the video buffer on screen\nVID_SHOW_BUFFER:\nbus_write 0\nbus_write 0\nret 0\n\n; @function Set the active video buffer (to draw into)\n; @arg buffer id (0 or 1)\nVID_SET_BUFFER:\npush r0\nadd rsp, 2, r0\nbus_write 0\nbus_write 1\nload r0, 0, r0\nbus_write r0\npop r0\nret 1\n\n; @function Clear the active video buffer\nVID_CLEAR_BUFFER:\nbus_write 0\nbus_write 2\nret 0\n\n; @function Draw a pixel in the active video buffer\n; @arg x-coordinate\n; @arg y-coordinate\n; @arg rgba16 color value\nVID_DRAW_PIXEL:\npush r0\npush r1\nadd rsp, 5, r0\nbus_write 0\nbus_write 3\nload r0, 0, r1\nbus_write r1\nload r0,-1, r1\nbus_write r1\nload r0,-2, r1\nbus_write r1\npop r1\npop r0\nret 3\n\n; @function Draw a line in the active video buffer\n; @arg x0\n; @arg y0\n; @arg x1\n; @arg y1\n; @arg rgba16 color value\nVID_DRAW_LINE:\npush r0\npush r1\nadd rsp, 7, r0\nbus_write 0\nbus_write 4\nload r0, 0, r1\nbus_write r1\nload r0,-1, r1\nbus_write r1\nload r0,-2, r1\nbus_write r1\nload r0,-3, r1\nbus_write r1\nload r0,-4, r1\nbus_write r1\npop r1\npop r0\nret 5\n\n; @function Draw a rectangle in the active video buffer\n; @arg x-coordinate\n; @arg y-coordinate\n; @arg width\n; @arg height\n; @arg rgba16 color value\nVID_DRAW_RECT:\npush r0\npush r1\nadd rsp, 7, r0\nbus_write 0\nbus_write 5\nload r0, 0, r1\nbus_write r1\nload r0,-1, r1\nbus_write r1\nload r0,-2, r1\nbus_write r1\nload r0,-3, r1\nbus_write r1\nload r0,-4, r1\nbus_write r1\npop r1\npop r0\nret 5\n\n; @function Draw a sprite in the active video buffer\n; @arg source x-coordinate\n; @arg source y-coordinate\n; @arg destination x-coordinate\n; @arg destination y-coordinate\n; @arg source width\n; @arg source height\n; @arg destination width\n; @arg destination height\nVID_DRAW_SPRITE:\npush r0\npush r1\nadd rsp, 10, r0\nbus_write 0\nbus_write 7\nload r0, 0, r1\nbus_write r1\nload r0,-1, r1\nbus_write r1\nload r0,-2, r1\nbus_write r1\nload r0,-3, r1\nbus_write r1\nload r0,-4, r1\nbus_write r1\nload r0,-5, r1\nbus_write r1\nload r0,-6, r1\nbus_write r1\nload r0,-7, r1\nbus_write r1\npop r1\npop r0\nret 8\n\n; Font size constants\n.const FONT_CH_W, 8\n.const FONT_CH_H, 8\n.const FONT_CH_W2, 16\n.const FONT_CH_H2, 16\n\n; @function Draw a string of characters\n; @arg string pointer\n; @arg x-coordinate\n; @arg y-coordinate\nVID_DRAW_STR:\n; save registers\npush r0          \npush r1\npush r2\npush r3\npush r4\npush r5\n; r0 = string pointer\n; r1 = dst x\n; r2 = dst y\nload rsp, 9, r0\nload rsp, 8, r1\nload rsp, 7, r2\n; character printing loop\nIO_PRINT_STR_LOOP:\n; r3 = current char\nload r0, 0, r3\n; If this is the null terminator, stop\njump_eq r3, 0, IO_PRINT_STR_DONE\n; compute src x, src y\nmul r3, FONT_CH_W, r4\nmov 0, r5\njump_lt r4, 512, IO_PRINT_STR_FIRST\nadd r5, FONT_CH_H, r5\nIO_PRINT_STR_FIRST:\n; Draw the character\npush r4\npush r5\npush r1\npush r2\npush FONT_CH_W\npush FONT_CH_H\npush FONT_CH_W2\npush FONT_CH_H2\ncall VID_DRAW_SPRITE\n; increment dst coords\nadd r1, FONT_CH_W2, r1\n; move to the next character\nadd r0, 1, r0\njump IO_PRINT_STR_LOOP\nIO_PRINT_STR_DONE:\n; restore saved registers\npop r5\npop r4\npop r3\npop r2\npop r1          \npop r0          \n; return, popping 3 arguments\nret 3\n\n;***************************************************************************\n; Input/Output (IO) handling\n;***************************************************************************\n\n; Key code constants\n.const KEY_LEFT_ARROW,  37\n.const KEY_UP_ARROW,    38\n.const KEY_RIGHT_ARROW, 39\n.const KEY_DOWN_ARROW,  40\n\n; @function Check whether a given key is currently pressed\n; @arg key code\nIO_KEY_DOWN:\nload rsp, 1, r0\nbus_write 1\nbus_write 0\nbus_write r0\nbus_read r0\nret 1\n\n;***************************************************************************\n; Character string utility functions\n;***************************************************************************\n\n; @function Compute the length of a string\n; @arg string pointer\nSTR_LENGTH:\n; save registers        \npush r1\npush r2\n; r0 = length\nmov 0, r0\n; r1 = string pointer\nload rsp, 3, r1\n; Read loop\nSTR_LENGTH_LOOP:\n; r2 = ptr[r0]\nload r1, r0, r2\njump_eq r2, 0, STR_LENGTH_DONE\n; length++\nadd r0, 1, r0\njump STR_LENGTH_LOOP\n; Loop exit\nSTR_LENGTH_DONE:\npop r2\npop r1\nret 1\n\n; @function Copy a string\n; @arg source string pointer\n; @arg destination pointer\nSTR_COPY:\npush r0\npush r1\npush r2\n; r0 = src pointer\n; r1 = dst pointer\nload rsp, 5, r0\nload rsp, 4, r1\n; Copy loop\nSTR_COPY_LOOP:\n; r2 = *src\n; *dst = r2\nload r0, 0, r2\nstore r1, 0, r2\njump_eq r2, 0, STR_COPY_DONE\n; ptr++\nadd r0, 1, r0\nadd r1, 1, r1\njump STR_COPY_LOOP\n; Loop exit\nSTR_COPY_DONE:\npop r2\npop r1\npop r0\nret 2\n\n; @function Append a string to another\n; @arg source string pointer\n; @arg destination pointer\nSTR_APPEND:\npush r0\npush r1\npush r2\n; r1 = src pointer\n; r2 = dst pointer\nload rsp, 5, r1\nload rsp, 4, r2\n; r0 = dst length\npush r2\ncall STR_LENGTH\n; r2 += length\nadd r2, r0, r2\n; copy src into the dst\npush r1\npush r2\ncall STR_COPY\n; Exit\npop r2\npop r1\npop r0\nret 2\n\n;***************************************************************************\n; User-written code is inserted after this point\n;***************************************************************************\n\n; Program start (main) label\nPROGRAM_START:\n';