# multi-player

Multi-Player game including network framework for clients to communicate with each other via WebSocket

1. Checkout repo:
```
$ git clone ssh://git@ssh.github.com/hookbot/multi-player
$ cd multi-player
```

2. Build dependencies:

```
$ make
```

3. Launch server:

```
$ make start
```

Hit CTRL-C to stop if you launch in the foreground.

OR to start/stop server in background:

```
$ make start &
$ make stop
```

4. Launch client:

[Browse to localhost:8888](http://127.0.0.1:8888/)
