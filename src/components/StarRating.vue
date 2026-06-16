<script setup lang="ts">
import { Star } from 'lucide-vue-next'

interface Props {
  modelValue: number
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

function setRating(value: number) {
  if (props.readonly) return
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="flex items-center gap-1">
    <button
      v-for="i in 5"
      :key="i"
      type="button"
      class="p-1 transition-transform hover:scale-110"
      :class="{ 'cursor-default': readonly, 'cursor-pointer': !readonly }"
      @click="setRating(i)"
    >
      <Star
        class="h-6 w-6"
        :class="i <= modelValue ? 'fill-amber-400 text-amber-400' : 'text-gray-300'"
      />
    </button>
  </div>
</template>
