#include "game.h"
#include <SDL2/SDL.h>

#define BLOCK 28
#define ORIGINX 134
#define ORIGINY 6
#define SCREENW 1024
#define SCREENH 768

SDL_Surface *screen, *mazeImg, *youImg, *numImg;
SDL_Renderer *renderer;
SDL_Window *window;
char filelist[10];

void Draw() {
  int p[4], j;
  SDL_Rect srcRect, dstRect;
  dstRect.x = 4 * BLOCK;
  dstRect.y = 0;
  dstRect.w = SCREENW - 8 * BLOCK;
  dstRect.h = SCREENH;
  SDL_FillRect(screen, &dstRect, SDL_MapRGB(screen->format, 0, 0, 128));
  dstRect.x = 0;
  dstRect.w = 4 * BLOCK;
  SDL_FillRect(screen, &dstRect, SDL_MapRGB(screen->format, 0, 0, 0));
  dstRect.x = 1024 - 4 * BLOCK;
  dstRect.w = 4 * BLOCK;
  SDL_FillRect(screen, &dstRect, SDL_MapRGB(screen->format, 0, 0, 0));
  srcRect.x = SKEY * BLOCK;
  srcRect.y = 0;
  srcRect.w = BLOCK;
  srcRect.h = BLOCK;
  dstRect.x = 2 * BLOCK;
  dstRect.w = BLOCK;
  dstRect.h = BLOCK;
  for (j = 0; j < GetSKeys(); j++) {
    dstRect.y = (j + 1) * 768 / (GetSKeys() + 1) - BLOCK / 2;
    SDL_BlitSurface(mazeImg, &srcRect, screen, &dstRect);
  }
  srcRect.x = GKEY * BLOCK;
  dstRect.x = SCREENW - 3 * BLOCK;
  for (j = 0; j < GetGKeys(); j++) {
    dstRect.y = (j + 1) * SCREENH / (GetGKeys() + 1) - BLOCK / 2;
    SDL_BlitSurface(mazeImg, &srcRect, screen, &dstRect);
  }
  for (p[0] = 0; p[0] < 5; p[0]++)
    for (p[1] = 0; p[1] < 5; p[1]++)
      for (p[2] = 0; p[2] < 5; p[2]++)
        for (p[3] = 0; p[3] < 5; p[3]++) {
          srcRect.x = BLOCK * GetDisplayF(p);
          dstRect.x =
              ORIGINX + BLOCK * p[0] + p[1] * 5 * BLOCK + p[1] * BLOCK / 2;
          dstRect.y =
              ORIGINY + BLOCK * p[2] + p[3] * 5 * BLOCK + p[3] * BLOCK / 2;
          SDL_BlitSurface(mazeImg, &srcRect, screen, &dstRect);
        }
  srcRect.x = 0;
  srcRect.y = 0;
  srcRect.w = BLOCK;
  srcRect.h = BLOCK;
  dstRect.x = ORIGINX + 13 * BLOCK;
  dstRect.y = ORIGINY + 13 * BLOCK;
  dstRect.w = BLOCK;
  dstRect.h = BLOCK;
  SDL_BlitSurface(youImg, &srcRect, screen, &dstRect);
  SDL_UpdateWindowSurface(window);
}

void Play(int fileNr) {
  if (!Init(fileNr)) return;
  Draw();
  SDL_Event event;
  char go = 1;
  do {
    if (SDL_PollEvent(&event))
      if (event.type == SDL_KEYDOWN) {
        switch (event.key.keysym.sym) {
          case SDLK_d:
            if (!Move(0, 1)) go = 0;
            break;
          case SDLK_a:
            if (!Move(0, -1)) go = 0;
            break;
          case SDLK_RIGHT:
            if (!Move(1, 1)) go = 0;
            break;
          case SDLK_LEFT:
            if (!Move(1, -1)) go = 0;
            break;
          case SDLK_s:
            if (!Move(2, 1)) go = 0;
            break;
          case SDLK_w:
            if (!Move(2, -1)) go = 0;
            break;
          case SDLK_DOWN:
          case SDLK_KP_2:
            if (!Move(3, 1)) go = 0;
            break;
          case SDLK_UP:
            if (!Move(3, -1)) go = 0;
            break;
          case SDLK_SPACE:
            Mix();
            break;
          case SDLK_ESCAPE:
            go = 0;
            break;
        }
        Draw();
        if (0) go = 0;
      }
  } while (go);
  Done();
}

int main(int argc, char **argv) {
  SDL_Init(SDL_INIT_VIDEO);
  SDL_CreateWindowAndRenderer(SCREENW, SCREENH, 0, &window, &renderer);
  screen = SDL_GetWindowSurface(window);
  mazeImg = SDL_LoadBMP("images/4dmaze.bmp");
  youImg = SDL_LoadBMP("images/you.bmp");
  numImg = SDL_LoadBMP("images/numbers.bmp");
  SDL_SetColorKey(youImg, SDL_TRUE, SDL_MapRGB(youImg->format, 0, 0, 0));
  SDL_SetColorKey(numImg, SDL_TRUE, SDL_MapRGB(numImg->format, 1, 1, 0));
  SDL_ShowCursor(SDL_DISABLE);
  SDL_Event event;
  char go = 1;
  int fileNr, minFileNr = 10, maxFileNr = -1;
  for (fileNr = 0; fileNr < 10; fileNr++)
    if (Init(fileNr)) {
      filelist[fileNr] = 1;
      Done();
      if (fileNr < minFileNr) minFileNr = fileNr;
      if (fileNr > maxFileNr) maxFileNr = fileNr;
    } else
      filelist[fileNr] = 0;
  fileNr = minFileNr;
  SDL_Rect srcRect, dstRect;
  srcRect.y = 0;
  srcRect.h = 2 * BLOCK;
  srcRect.w = 2 * BLOCK;
  dstRect.y = SCREENH / 2 - BLOCK;
  dstRect.h = 2 * BLOCK;
  dstRect.w = 2 * BLOCK;
  while (go) {
    int i;
    for (i = 0; i < 10; i++)
      if (filelist[i] == 1) {
        srcRect.x = i * 2 * BLOCK;
        dstRect.x = SCREENW / 2 + (i * 2 - 1 - maxFileNr + minFileNr) * BLOCK;
        SDL_BlitSurface(numImg, &srcRect, screen, &dstRect);
      }
    srcRect.x = 20 * BLOCK;
    dstRect.x = SCREENW / 2 + (fileNr * 2 - 1 - maxFileNr + minFileNr) * BLOCK;
    SDL_BlitSurface(numImg, &srcRect, screen, &dstRect);
    SDL_UpdateWindowSurface(window);
    while (SDL_PollEvent(&event))
      if (event.type == SDL_KEYDOWN) switch (event.key.keysym.sym) {
          case SDLK_ESCAPE:
            go = 0;
            break;
          case SDLK_RIGHT:
          case SDLK_KP_6:
            if (fileNr < maxFileNr) do
                fileNr++;
              while (filelist[fileNr] == 0);
            break;
          case SDLK_LEFT:
          case SDLK_KP_4:
            if (fileNr > minFileNr) do
                fileNr--;
              while (filelist[fileNr] == 0);
            break;
          case SDLK_RETURN:
            Play(fileNr);
            break;
        }
  }
  SDL_FreeSurface(mazeImg);
  SDL_FreeSurface(youImg);
  SDL_FreeSurface(numImg);
  SDL_Quit();
}
