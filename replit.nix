{ pkgs }: {
    deps = [
      pkgs.nano
        pkgs.tor
        pkgs.nodejs-16_x
    ];
}