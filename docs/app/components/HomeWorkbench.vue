<script setup lang="ts">
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Tabs } from "./ui/tabs";
const active = ref("preview");
const name = ref("Design engineering");
const visibility = ref("team");
const notifications = ref(true);
const updates = ref(false);
const volume = ref(65);
const saved = ref(false);
watch([name, visibility, notifications, updates, volume], () => (saved.value = false));
const source = `<script setup lang="ts">
import { Switch } from 'akaza-ui'
import { ref } from 'vue'
const notifications = ref(true)
</${"script"}>

<template>
  <Switch v-model="notifications">
    <template #label>Notifications</template>
    <template #thumb="{ checked }">
      <span :class="checked ? 'on' : 'off'" />
    </template>
  </Switch>
</template>`;
</script>
<template>
  <div
    data-ui
    class="rounded-xl bg-muted p-3 sm:p-5"
  >
    <Tabs
      v-model="active"
      :items="[
        { value: 'preview', label: 'Preview' },
        { value: 'code', label: 'Slots API' },
      ]"
      aria-label="Component demonstration"
      :ui="{ list: 'mb-5 w-fit bg-secondary', indicator: 'bg-background', root: 'gap-0' }"
    >
      <template #panel-preview>
        <form
          class="rounded-lg bg-background p-5 sm:p-7"
          @submit.prevent="saved = true"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-xl font-semibold tracking-tight">Workspace preferences</h2>
              <p class="mt-1 text-sm text-muted-foreground">A little UI. All the behavior.</p>
            </div>
            <Icon
              name="lucide:sliders-horizontal"
              class="mt-1 size-5 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <div class="mt-7 grid gap-5">
            <label class="grid gap-2 text-sm font-medium">Workspace name<Input
              v-model="name"
              aria-label="Workspace name"
              required
            /></label>
            <div class="grid gap-2">
              <span
                id="visibility-label"
                class="text-sm font-medium"
              >Visibility</span><Select
                v-model="visibility"
                aria-labelledby="visibility-label"
                :options="[
                  { value: 'team', label: 'Everyone in the team' },
                  { value: 'private', label: 'Only invited people' },
                  { value: 'public', label: 'Anyone with the link' },
                ]"
              />
            </div>
            <Switch
              v-model="notifications"
              label="Notifications"
              description="Stay in the loop on team activity."
              :ui="{ wrapper: 'flex-row-reverse justify-between', text: 'flex-1' }"
            />
            <Switch
              v-model="updates"
              label="Product updates"
              description="A heads-up when something new ships."
              :ui="{ wrapper: 'flex-row-reverse justify-between', text: 'flex-1' }"
            />
            <div class="grid gap-3">
              <div class="flex justify-between text-sm">
                <span
                  id="volume-label"
                  class="font-medium"
                >Notification volume</span><output class="text-muted-foreground">{{ volume }}%</output>
              </div>
              <Slider
                v-model="volume"
                aria-labelledby="volume-label"
                :min="0"
                :max="100"
              />
            </div>
          </div>
          <div class="mt-7 flex items-center justify-between gap-3">
            <span
              role="status"
              class="text-xs text-muted-foreground"
            >{{ saved ? "Saved in this preview." : "Try it with your keyboard." }}</span><Button
              type="submit"
              size="sm"
            >
              {{ saved ? "Saved" : "Save preferences"
              }}<Icon
                :name="saved ? 'lucide:check' : 'lucide:arrow-right'"
                class="size-4"
                aria-hidden="true"
              />
            </Button>
          </div>
        </form>
      </template>
      <template #panel-code>
        <DocsCode
          :code="source"
          language="vue"
          filename="Notifications.vue"
          class="my-0! border-0"
        />
      </template>
    </Tabs>
  </div>
</template>
